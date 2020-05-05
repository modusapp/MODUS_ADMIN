const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage');
const spawn = require('child-process-promise').spawn;
const mkdirp = require('mkdirp-promise');
const path = require('path');
const os = require('os');
const fs = require('fs');
const admin = require('firebase-admin');
if (!admin.apps.length) {
    admin.initializeApp();
}
const storage = admin.storage();



exports.handler = ((data)=>{
    // File and directory paths.
    const filePath = data.name;
    const tempLocalFile = path.join(os.tmpdir(), filePath);
    const tempLocalDir = path.dirname(tempLocalFile);

    const fileSize = Number(data.size);

    var size;
    var crop;

    // Exit if this is triggered on a file that is not an image.
    if (!data.contentType.startsWith('image/')) {
        console.log('This is not an image.');
        return true;
    }

    // Exit if this is a move or deletion event.
    if (data.resourceState === 'not_exists') {
        console.log('This is a deletion event.');
        return true;
    }

    // Exit if file exists but is not new and is only being triggered
    // because of a metadata change.
    if (data.resourceState === 'exists' && data.metageneration > 1) {
        console.log('This is a metadata change event.');
        return true;
    }

    // In my case i determine the size of the image based on the extension, 
    // but you can ignore this part or  use a custom rule.
   /* if( fileSize <= 5242880){
        console.log("File too small to compress");
        return null;
    } */
    if (data.contentType === 'image/jpeg') {
        size = "1920x1080^";
        crop = "1920x1080+0+0";
    } else {
        size = "200x200^";
        crop = "200x200+0+0";
    }

    console.log("File Size: ", fileSize);
    // Cloud Storage files.

    const bucket = storage.bucket(data.bucket);
    const file = bucket.file(filePath);

    return file.getMetadata()
        .then(([metadata]) => {
            if (metadata.metadata && metadata.metadata.optimized) {
                return Promise.reject('Image has been already optimized');
            }
            return Promise.resolve();
        })
        .then(() => mkdirp(tempLocalDir))
        .then(() => file.download({ destination: tempLocalFile }))
        .then(() => {
            console.log('Resize to: ' + size);
            return spawn('convert', [tempLocalFile, '-resize', size,  tempLocalFile]);
        })
        .then(() => {
            console.log('The file has been downloaded to', tempLocalFile);
            return spawn('convert', [tempLocalFile, '-strip', '-interlace', 'Plane', '-quality', '80', tempLocalFile]);
        })
        .then(() => {
            console.log('Optimized image created at', tempLocalFile);
            // Uploading the Optimized image.
            return bucket.upload(tempLocalFile, {
                destination: file,
                gzip: true,
                metadata: {
                    metadata: {
                        optimized: true
                    },
                    cacheControl: 'public, max-age=715360'
                }
            });
        })
        .then(() => {
            console.log('Optimized image uploaded to Storage at', file);
            // Once the image has been uploaded delete the local files to free up disk space.
            fs.unlinkSync(tempLocalFile);
            return true;
        });
});

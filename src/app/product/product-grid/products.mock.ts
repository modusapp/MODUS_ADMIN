const products = [{
    id: 0,
    starred: true,
    image: 'https://firebasestorage.googleapis.com/v0/b/coffessions-server.appspot.com/o/Coffee%20Coffee.jpeg?alt=media&token=48d2c0ae-158a-4d79-8629-dba5204cb302',
    title: 'Cappucino',
    subtitle: 'Regular',
    price: 2.99,
    isSale: false,
    rating: 4.7,
  }
];

export default products;

export function toggle(id) {
   const product = this.products.find((p) => p.id === id);
   const isAlreadyStarred = product.starred;

   product.starred = !isAlreadyStarred;
}

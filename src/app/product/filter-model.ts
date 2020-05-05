import { Product } from '../interfaces/models';

export class ProductFilter {

    private filterCategory: boolean = false;
    public filterInStock: boolean = false;
    public filterSale: boolean = false;
    public category: string = null;

    constructor() {

    }

    resetFilter() {
        this.filterCategory = false;
        this.filterInStock = false;
        this.filterSale = false;
        this.category = null;
    }

    canShow(product: Product) {
        let isCategory = false;
        const stock = false;
        const sale = false;
        if (this.filterCategory) {
            if (product.category === this.category) {
                isCategory = true;
            } else {
                isCategory = false;
            }
        } else {
            isCategory = true;
        }


    }

}

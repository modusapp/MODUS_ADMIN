export interface Category {
  name: string;
  id: string | null;
  photo: string | null;
  productCount?: number | null;
  prepared_by?: string | null;
  index?: number | null;
  available_on_mobile?: boolean | null;
}
export interface Product {
  description: string | null;
  photo: string | null;
  name: string | null;
  base_price: number | null;
  category: string;
  id: string | null;
  options: ProductOption[];
  in_stock: boolean | null;
  on_sale: boolean | null;
  sale_base_price: number | null;
  deliverable?: boolean | null;
  available_on_mobile?: boolean | null;
}

export interface ProductOption {
  option_name: string;
  radio: boolean;
  has_quantity: boolean;
  terms: OptionTerm[];
  required: boolean;
  has_checkbox: boolean;
}

export interface OptionTerm {
  name: string;
  add_price: number;
  default?: boolean;
  quantity?: number;
  checked?: boolean;
}

export interface Order {
  id?: string | null;
  order_items?: OrderLineItem[];
  instructions: string | null;
  food_instructions?: string | null;
  total_price: number;
  delivery_type?: 'pickUp'| 'inStore' | 'delivery';
  processing: boolean;
  completed: boolean;
  customer_name: string;
  customer_phone: number;
  created_at: number;
  completed_at?: number;
  user_id?: string;
  user?: any;
  test?: boolean;
  location_information?: LocationInformation;
  prepared_by?: string[] | null;
  staged?: boolean;
  delivery_info?: DeliveryInfo;
  pickup_info?: PickupInfo;
}
export interface DeliveryInfo{
  address: string;
}
export interface PickupInfo{
  start_time: Date | string;
  end_time: Date | string;
  license_plate_no?: string;
  pickup_type?: "togo" | "dineIn" | "drive";
}

// OrderLineItem is a single Product
// Options is an array of OptionConfig
// an OptionConfig is a Product Option
// an OptionConfig will contain the user's option selections
// This model will contain the total calculated price of the options selected plus base price
// It will also contain the quantity of this exact Product and Options in the order
export interface OrderLineItem {
  product_id: string;
  options: OptionConfig[];
  quantity: number;
  price: number;
  product?: Product;
  display?: any[];
}

// OptionCofig is a Product Option
// if option is radio
// can't have quantity
// values has one value
// that one value is the chosen option term
// the chosen term has add price, name, and will not have a quantity
// if option is checkbox
// it will not have a quantity, because the terms contain the quantity
// values will have as many values as there are terms for this option
// those values will specify if the term is checked, and if it has a quantity, and what the per quantity add price is
export interface OptionConfig {
  option_name: string;
  radio: boolean;
  has_quantity: boolean;
  values: OptionTerm[];
  required: boolean;
  has_checkbox: boolean;
}

//MARK: Authentication Models
export interface FirebaseUser {
  uid: string;
  email: string;
  phoneNumber?: number;
}
export interface AdminProfile extends FirebaseUser {
  admin?: boolean;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  displayName?: string;
  title?: string;
  // attributes are in camelcase to conform to Firebase auth user models
}
export interface CustomerProfile extends FirebaseUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  favorites: (Product | OrderLineItem)[];
  // attributes are in camelcase to conform to Firebase auth user models
}
export interface LocationInformation {
  tracking_enabled: boolean;
  lat?: number;
  lng?: number;
  last_updated_at?: Date;
  arrived: boolean;
}




// FAKE DATA MODELS

export const TEST_PRODUCT: Product = {
  id: "7TGvLpgVQUPUP4f48pi8",
  base_price: 3.99,
  category: "RKlFQEonLwOoGdXpz8yr",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing…ulla pariatur. Excepteur sint occaecat cupidatat ",
  in_stock: true,
  name: "Cappucino",
  on_sale: true,
  options: [
    {
      "has_quantity": false,
      "option_name": "Size",
      "radio": true,
      "terms": [
        { "add_price": 0, "name": "Small" },
        { "add_price": 0.50, "name": "Medium" },
        { "add_price": 1, "name": "Large" }
      ],
      has_checkbox: false,
      required: true
    },
    {
      "has_quantity": true,
      "option_name": "Espresso",
      "radio": false,
      "has_checkbox": false,
      "required": false,
      "terms": [
        { "add_price": 0.25, "name": "Shot" }
      ]
    }
  ],
  photo: "https://firebasestorage.googleapis.com/v0/b/coffessions-server.appspot.com/o/Coffee%20Coffee.jpeg?alt=media&token=f72f991b-e265-463a-b593-d13a8d82c017",
  sale_base_price: 2.99
};

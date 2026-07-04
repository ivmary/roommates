export interface ListingOwner {
  _id: string;
  name: string;
  avatar?: string;
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  city: string;
  street: string;
  price: number;
  rooms: string;
  available: string;
  gender: string;
  pets: boolean;
  smoking: boolean;
  students: boolean;
  furnished: boolean;
  images: string[];
  owner: ListingOwner;
  createdAt: string;
}

export interface ListingFormValues {
  title: string;
  description: string;
  city: string;
  street: string;
  price: string;
  rooms: string;
  available: string;
  gender: string;
  pets: boolean;
  smoking: boolean;
  students: boolean;
  furnished: boolean;
  images: string[];
}

export interface ListingSubmitPayload {
  values: ListingFormValues;
  newFiles: File[];
}

export const emptyListingFormValues: ListingFormValues = {
  title: "",
  description: "",
  city: "",
  street: "",
  price: "",
  rooms: "",
  available: "",
  gender: "",
  pets: false,
  smoking: false,
  students: false,
  furnished: false,
  images: [],
};

export interface Book {
  bookId: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

export interface PagedBookResult {
  books: Book[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sortField: string;
  sortOrder: string;
  category?: string;
}

// Create a cart item model
export interface CartItem {
  book: Book;
  quantity: number;
  subtotal: number;
}

// Create shopping cart model
export interface ShoppingCart {
  items: CartItem[];
  totalPrice: number;
  itemCount: number;
  lastViewedUrl: string;
} 
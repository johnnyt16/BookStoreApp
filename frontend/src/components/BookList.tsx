import { useState, useEffect } from 'react';
import { getBooks, isUsingRealApiData } from '../services/bookService';
import { Book, PagedBookResult, CartItem, ShoppingCart } from '../types/Book';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';

const BookList = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookData, setBookData] = useState<PagedBookResult | null>(null);
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [usingMockData, setUsingMockData] = useState<boolean>(true); // Default to true until we confirm real API
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>(['All']);
  
  // Shopping cart state
  const [cart, setCart] = useState<ShoppingCart>(() => {
    // Initialize from localStorage if available
    const savedCart = localStorage.getItem('bookstoreCart');
    return savedCart 
      ? JSON.parse(savedCart)
      : { items: [], totalPrice: 0, itemCount: 0, lastViewedUrl: window.location.pathname };
  });
  
  // Show/hide cart modal
  const [showCart, setShowCart] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, [currentPage, pageSize, sortField, sortOrder, selectedCategory]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bookstoreCart', JSON.stringify(cart));
  }, [cart]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Pass the selected category to the API
      const categoryFilter = selectedCategory !== 'All' ? selectedCategory : '';
      const data = await getBooks(currentPage, pageSize, sortField, sortOrder, categoryFilter);
      setBookData(data);
      setError(null);
      
      // Update mock data status based on the API result
      setUsingMockData(!isUsingRealApiData());

      // Extract unique categories from the data if we have all books
      if (!categoryFilter && data.totalCount > 0) {
        // Get all books to extract categories
        const allData = await getBooks(1, data.totalCount, sortField, sortOrder, '');
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(allData.books.map(book => book.category))];
        setCategories(uniqueCategories);
      }
    } catch (err: any) {
      console.error('Error in BookList component:', err);
      let errorMessage = 'Failed to fetch books. Please try again later.';
      
      // Try to extract more detailed error information
      if (err.message) {
        errorMessage += ` Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (field !== sortField) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  
  // Shopping cart methods
  const addToCart = (book: Book) => {
    setCart(prevCart => {
      // Check if book is already in cart
      const existingItem = prevCart.items.find(item => item.book.bookId === book.bookId);
      
      if (existingItem) {
        // Increase quantity if already in cart
        const updatedItems = prevCart.items.map(item => 
          item.book.bookId === book.bookId 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.book.price } 
            : item
        );
        
        return {
          ...prevCart,
          items: updatedItems,
          totalPrice: updatedItems.reduce((sum, item) => sum + item.subtotal, 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          lastViewedUrl: location.pathname
        };
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          book,
          quantity: 1,
          subtotal: book.price
        };
        
        return {
          ...prevCart,
          items: [...prevCart.items, newItem],
          totalPrice: prevCart.totalPrice + book.price,
          itemCount: prevCart.itemCount + 1,
          lastViewedUrl: location.pathname
        };
      }
    });
    
    // Show the cart after adding item
    setShowCart(true);
  };
  
  const removeFromCart = (bookId: number) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.book.bookId !== bookId);
      
      return {
        ...prevCart,
        items: updatedItems,
        totalPrice: updatedItems.reduce((sum, item) => sum + item.subtotal, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });
  };
  
  const updateQuantity = (bookId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item => 
        item.book.bookId === bookId 
          ? { 
              ...item, 
              quantity: newQuantity, 
              subtotal: newQuantity * item.book.price 
            } 
          : item
      );
      
      return {
        ...prevCart,
        items: updatedItems,
        totalPrice: updatedItems.reduce((sum, item) => sum + item.subtotal, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });
  };
  
  const continueShopping = () => {
    setShowCart(false);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!bookData) return null;

    const { totalPages } = bookData;
    const pages = [];

    // Previous button
    pages.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
      </li>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button
            className="page-link"
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </li>
      );
    }

    // Next button
    pages.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </li>
    );

    return (
      <nav aria-label="Book pagination">
        <ul className="pagination">{pages}</ul>
      </nav>
    );
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Render shopping cart modal
  const renderCartModal = () => {
    if (!showCart) return null;
    
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
           style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
        <div className="bg-white p-4 rounded shadow-lg" style={{ width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Shopping Cart</h3>
            <button className="btn-close" onClick={() => setShowCart(false)}></button>
          </div>
          
          {cart.items.length === 0 ? (
            <div className="alert alert-info">Your cart is empty.</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map(item => (
                      <tr key={item.book.bookId}>
                        <td>{item.book.title}</td>
                        <td>{formatPrice(item.book.price)}</td>
                        <td>
                          <div className="input-group input-group-sm" style={{ width: '120px' }}>
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => updateQuantity(item.book.bookId, item.quantity - 1)}
                            >
                              -
                            </button>
                            <input 
                              type="text" 
                              className="form-control text-center" 
                              value={item.quantity}
                              readOnly
                            />
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => updateQuantity(item.book.bookId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>{formatPrice(item.subtotal)}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => removeFromCart(item.book.bookId)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-dark">
                      <td colSpan={3} className="text-end fw-bold">Total:</td>
                      <td className="fw-bold">{formatPrice(cart.totalPrice)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-secondary" onClick={continueShopping}>
                  Continue Shopping
                </button>
                <button className="btn btn-success">
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render cart summary badge
  const renderCartSummary = () => {
    return (
      <div className="position-sticky top-0 start-100 translate-middle">
        <button 
          className="btn btn-primary position-relative rounded-circle p-3"
          onClick={() => setShowCart(true)}
          style={{ width: '60px', height: '60px' }}
        >
          <i className="bi bi-cart-fill fs-4"></i>
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {cart.itemCount}
          </span>
        </button>
      </div>
    );
  };

  if (loading && !bookData) {
    return <div className="text-center p-5">Loading books...</div>;
  }

  return (
    <div className="container-fluid my-4">
      {/* Cart modal */}
      {renderCartModal()}
      
      {/* Main content using Bootstrap Grid */}
      <div className="row">
        {/* Sidebar for filtering - takes 3 columns on medium and larger screens */}
        <div className="col-md-3 mb-4">
          <div className="card sticky-top" style={{ top: '1rem' }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Filter Books</h5>
            </div>
            <div className="card-body">
              <h6 className="card-subtitle mb-3">Categories</h6>
              <div className="list-group">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`list-group-item list-group-item-action ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Cart summary card - #notcoveredinthevideos - Bootstrap Sticky positioning */}
          <div className="card mt-4 sticky-top" style={{ top: '20rem' }}>
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Cart Summary</h5>
            </div>
            <div className="card-body">
              <p><strong>Items:</strong> {cart.itemCount}</p>
              <p><strong>Total:</strong> {formatPrice(cart.totalPrice)}</p>
              <button 
                className="btn btn-success w-100"
                onClick={() => setShowCart(true)}
                disabled={cart.items.length === 0}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content - takes 9 columns on medium and larger screens */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <h2 className="mb-0">
              {selectedCategory === 'All' || !selectedCategory 
                ? 'All Books' 
                : `${selectedCategory} Books`}
            </h2>
            
            {/* Cart button for small screens */}
            <div className="d-block d-md-none mb-3">
              <button 
                className="btn btn-primary position-relative"
                onClick={() => setShowCart(true)}
              >
                <i className="bi bi-cart"></i> View Cart
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cart.itemCount}
                </span>
              </button>
            </div>
          </div>
          
          {usingMockData ? (
            <div className="alert alert-info mb-3">
              <strong>Using sample data:</strong> Backend API connection not detected. 
              Using local sample data instead of the real database.
            </div>
          ) : null}
          
          {error && (
            <div className="alert alert-danger mb-3">
              {error}
              <div className="mt-2">
                <button className="btn btn-primary" onClick={fetchBooks}>
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Controls row */}
          <div className="row g-3 mb-4 align-items-center">
            <div className="col-sm-auto">
              <label className="col-form-label">Books per page:</label>
            </div>
            <div className="col-sm-auto">
              <select
                className="form-select"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="col-sm-auto ms-auto">
              <button 
                className="btn btn-outline-primary" 
                onClick={fetchBooks} 
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {loading && <div className="text-center p-3">Loading...</div>}

          {!loading && (
            <>
              {/* Book cards using Bootstrap Grid - #notcoveredinthevideos - Bootstrap Card Deck with responsive grid */}
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
                {bookData?.books.map((book: Book) => (
                  <div className="col" key={book.bookId}>
                    <div className="card h-100 shadow-sm">
                      <div className="card-header bg-light">
                        <h5 className="card-title mb-0 text-truncate" title={book.title}>{book.title}</h5>
                      </div>
                      <div className="card-body">
                        <p className="card-text"><strong>Author:</strong> {book.author}</p>
                        <p className="card-text"><strong>Category:</strong> 
                          <span className="badge bg-secondary ms-1">{book.category}</span>
                        </p>
                        <p className="card-text"><strong>Price:</strong> {formatPrice(book.price)}</p>
                      </div>
                      <div className="card-footer bg-white border-top-0">
                        <button 
                          className="btn btn-primary w-100" 
                          onClick={() => addToCart(book)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {bookData && bookData.books.length === 0 && (
                <div className="alert alert-info">No books found.</div>
              )}

              <div className="d-flex justify-content-between align-items-center flex-wrap">
                {bookData && (
                  <div className="mb-2 mb-md-0">
                    Showing {bookData.books.length} of {bookData.totalCount} books
                  </div>
                )}
                {renderPagination()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookList; 
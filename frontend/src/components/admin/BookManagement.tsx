import { useState, useEffect } from 'react';
import { Book } from '../../types/Book';
import { getBooks, addBook, updateBook, deleteBook } from '../../services/bookService';
import BookForm from './BookForm';
import 'bootstrap/dist/css/bootstrap.min.css';

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Edit/Add modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentBook, setCurrentBook] = useState<Book | undefined>(undefined);
  const [modalTitle, setModalTitle] = useState<string>('Add New Book');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'danger' } | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [pageNumber, pageSize]);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getBooks(pageNumber, pageSize);
      setBooks(result.books);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleAddBook = () => {
    setCurrentBook(undefined);
    setModalTitle('Add New Book');
    setShowModal(true);
  };

  const handleEditBook = (book: Book) => {
    setCurrentBook(book);
    setModalTitle('Edit Book');
    setShowModal(true);
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    
    try {
      await deleteBook(bookToDelete.bookId);
      setShowDeleteModal(false);
      setNotification({ message: 'Book deleted successfully!', type: 'success' });
      fetchBooks(); // Refresh the list
    } catch (err) {
      console.error('Error deleting book:', err);
      setNotification({ message: 'Failed to delete book. Please try again.', type: 'danger' });
    }
  };

  const handleFormSubmit = async (bookData: Omit<Book, 'bookId'> | Book) => {
    try {
      if ('bookId' in bookData) {
        // Update existing book
        await updateBook(bookData.bookId, bookData as Book);
        setNotification({ message: 'Book updated successfully!', type: 'success' });
      } else {
        // Add new book
        await addBook(bookData);
        setNotification({ message: 'Book added successfully!', type: 'success' });
      }
      
      setShowModal(false);
      fetchBooks(); // Refresh the list
    } catch (err) {
      console.error('Error saving book:', err);
      setNotification({ message: 'Failed to save book. Please try again.', type: 'danger' });
    }
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Render table of books
  const renderBooksTable = () => {
    if (loading) return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (books.length === 0) return <div className="alert alert-info">No books found.</div>;

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.bookId}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>{formatPrice(book.price)}</td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleEditBook(book)}
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteClick(book)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    
    // Previous button
    pages.push(
      <li key="prev" className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber === 1}
        >
          Previous
        </button>
      </li>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${pageNumber === i ? 'active' : ''}`}>
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
      <li key="next" className={`page-item ${pageNumber === totalPages ? 'disabled' : ''}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages}
        >
          Next
        </button>
      </li>
    );

    return (
      <nav aria-label="Book pagination">
        <ul className="pagination justify-content-center">{pages}</ul>
      </nav>
    );
  };

  return (
    <div className="container my-4">
      {/* Notification alert */}
      {notification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
          {notification.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setNotification(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Book Management</h2>
        <button className="btn btn-success" onClick={handleAddBook}>
          <i className="bi bi-plus-circle"></i> Add New Book
        </button>
      </div>
      
      {/* Books table */}
      {renderBooksTable()}
      
      {/* Pagination */}
      {renderPagination()}
      
      {/* Add/Edit Book Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalTitle}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <BookForm 
                  book={currentBook} 
                  onSubmit={handleFormSubmit} 
                  onCancel={() => setShowModal(false)} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete "<strong>{bookToDelete?.title}</strong>"?</p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement; 
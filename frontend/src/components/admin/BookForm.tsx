import { useState, useEffect } from 'react';
import { Book } from '../../types/Book';

interface BookFormProps {
  book?: Book;
  onSubmit: (book: Omit<Book, 'bookId'> | Book) => void;
  onCancel: () => void;
}

const BookForm = ({ book, onSubmit, onCancel }: BookFormProps) => {
  const [formData, setFormData] = useState<Omit<Book, 'bookId'> | Book>({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    classification: '',
    category: '',
    pageCount: 0,
    price: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with book data if editing
  useEffect(() => {
    if (book) {
      setFormData(book);
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;
    
    // Parse numeric values
    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value);
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
      isValid = false;
    }
    
    if (!formData.publisher.trim()) {
      newErrors.publisher = 'Publisher is required';
      isValid = false;
    }
    
    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required';
      isValid = false;
    }
    
    if (!formData.classification.trim()) {
      newErrors.classification = 'Classification is required';
      isValid = false;
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
      isValid = false;
    }
    
    // Validate numeric fields
    if (formData.pageCount <= 0) {
      newErrors.pageCount = 'Page count must be a positive number';
      isValid = false;
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be a positive number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="needs-validation">
      <div className="mb-3">
        <label htmlFor="title" className="form-label">Title</label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="author" className="form-label">Author</label>
        <input
          type="text"
          className={`form-control ${errors.author ? 'is-invalid' : ''}`}
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
        />
        {errors.author && <div className="invalid-feedback">{errors.author}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="publisher" className="form-label">Publisher</label>
        <input
          type="text"
          className={`form-control ${errors.publisher ? 'is-invalid' : ''}`}
          id="publisher"
          name="publisher"
          value={formData.publisher}
          onChange={handleChange}
          required
        />
        {errors.publisher && <div className="invalid-feedback">{errors.publisher}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="isbn" className="form-label">ISBN</label>
        <input
          type="text"
          className={`form-control ${errors.isbn ? 'is-invalid' : ''}`}
          id="isbn"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
          required
        />
        {errors.isbn && <div className="invalid-feedback">{errors.isbn}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="classification" className="form-label">Classification</label>
        <input
          type="text"
          className={`form-control ${errors.classification ? 'is-invalid' : ''}`}
          id="classification"
          name="classification"
          value={formData.classification}
          onChange={handleChange}
          required
        />
        {errors.classification && <div className="invalid-feedback">{errors.classification}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="category" className="form-label">Category</label>
        <input
          type="text"
          className={`form-control ${errors.category ? 'is-invalid' : ''}`}
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
        {errors.category && <div className="invalid-feedback">{errors.category}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="pageCount" className="form-label">Page Count</label>
        <input
          type="number"
          className={`form-control ${errors.pageCount ? 'is-invalid' : ''}`}
          id="pageCount"
          name="pageCount"
          value={formData.pageCount}
          onChange={handleChange}
          min="1"
          required
        />
        {errors.pageCount && <div className="invalid-feedback">{errors.pageCount}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="price" className="form-label">Price</label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
          />
          {errors.price && <div className="invalid-feedback">{errors.price}</div>}
        </div>
      </div>
      
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {book ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
};

export default BookForm; 
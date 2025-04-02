import BookList from './components/BookList';
import BookManagement from './components/admin/BookManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';

// Import Bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  // Load Bootstrap JS on component mount
  useEffect(() => {
    // Dynamic import of Bootstrap JS
    // @ts-ignore: Bootstrap JS doesn't have TypeScript types
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="bg-dark text-white p-4 mb-3">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col">
                <h1>Online Bookstore</h1>
                <p className="lead mb-0">Browse our collection of books</p>
              </div>
              <div className="col-auto">
                <nav className="navbar navbar-expand navbar-dark">
                  <ul className="navbar-nav">
                    <li className="nav-item">
                      <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/books">Manage Books</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/admin/books" element={<BookManagement />} />
            <Route path="*" element={<BookList />} />
          </Routes>
        </main>
        
        <footer className="bg-light text-center p-3 mt-5">
          <div className="container">
            <p className="text-muted mb-0">© 2023 Online Bookstore. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

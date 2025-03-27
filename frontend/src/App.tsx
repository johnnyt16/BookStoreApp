import BookList from './components/BookList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

// Import Bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  // Load Bootstrap JS on component mount
  useEffect(() => {
    // Dynamic import of Bootstrap JS
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
            </div>
          </div>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<BookList />} />
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

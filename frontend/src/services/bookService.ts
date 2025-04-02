import axios from 'axios';
import { Book, PagedBookResult } from '../types/Book';

// Azure deployed API endpoint
const AZURE_API_ENDPOINT = 'https://bookstoreapp-mcconkie-backend.azurewebsites.net/api';

// List of fallback API endpoints to try in order (if Azure is temporarily unavailable)
const FALLBACK_API_ENDPOINTS = [
  'http://localhost:5000/api',   // Default .NET Core HTTP port
  'https://localhost:7143/api',  // Default .NET Core HTTPS port
  'http://localhost:5200/api',   // Explicitly specified port
  'http://localhost:5017/api'    // Another common port
];

// Keep track of working API endpoint
let currentApiUrl: string | null = null;
let isTestingEndpoints = false;

const findWorkingApiEndpoint = async (): Promise<string> => {
  if (currentApiUrl) return currentApiUrl;
  if (isTestingEndpoints) return AZURE_API_ENDPOINT; // Prevent recursive testing
  
  isTestingEndpoints = true;
  console.log('Testing API endpoints to find a working one...');
  
  // Try Azure endpoint first
  try {
    console.log(`Trying Azure endpoint: ${AZURE_API_ENDPOINT}`);
    const response = await axios.get(`${AZURE_API_ENDPOINT}/Books`, { 
      params: { pageNumber: 1, pageSize: 1 },
      timeout: 8000 // Longer timeout for Azure
    });
    if (response.status === 200) {
      console.log(`Connected to Azure backend: ${AZURE_API_ENDPOINT}`);
      currentApiUrl = AZURE_API_ENDPOINT;
      isTestingEndpoints = false;
      return AZURE_API_ENDPOINT;
    }
  } catch (error: any) {
    console.log(`Azure endpoint failed:`, error.message);
    console.log('Falling back to local endpoints...');
  }
  
  // If Azure fails, try local endpoints as fallback
  for (const endpoint of FALLBACK_API_ENDPOINTS) {
    try {
      console.log(`Trying local endpoint: ${endpoint}`);
      const response = await axios.get(`${endpoint}/Books`, { 
        params: { pageNumber: 1, pageSize: 1 },
        timeout: 5000 // Timeout after 5 seconds
      });
      if (response.status === 200) {
        console.log(`Found working endpoint: ${endpoint}`);
        currentApiUrl = endpoint;
        isTestingEndpoints = false;
        return endpoint;
      }
    } catch (error: any) {
      console.log(`Endpoint ${endpoint} failed:`, error.message);
    }
  }
  
  console.error('No working API endpoints found.');
  isTestingEndpoints = false;
  throw new Error('Cannot connect to the backend API. Please ensure the backend server is running or check your network connection.');
};

// Function to get books with pagination and sorting
export const getBooks = async (
  pageNumber: number = 1,
  pageSize: number = 5,
  sortField: string = 'title',
  sortOrder: string = 'asc',
  category: string = ''
): Promise<PagedBookResult> => {
  try {
    const apiUrl = await findWorkingApiEndpoint();
    console.log(`Fetching books from: ${apiUrl}/Books with params:`, { pageNumber, pageSize, sortField, sortOrder, category });
    
    const response = await axios.get<PagedBookResult>(`${apiUrl}/Books`, {
      params: {
        pageNumber,
        pageSize,
        sortField,
        sortOrder,
        category
      }
    });
    
    console.log('Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    throw error;
  }
};

// Function to get a single book by ID
export const getBookById = async (id: number): Promise<Book> => {
  try {
    const apiUrl = await findWorkingApiEndpoint();
    const response = await axios.get<Book>(`${apiUrl}/Books/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error);
    throw error;
  }
};

// Function to add a new book
export const addBook = async (book: Omit<Book, 'bookId'>): Promise<Book> => {
  try {
    const apiUrl = await findWorkingApiEndpoint();
    const response = await axios.post<Book>(`${apiUrl}/Books`, book);
    console.log('Book added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

// Function to update an existing book
export const updateBook = async (id: number, book: Book): Promise<void> => {
  if (id !== book.bookId) {
    throw new Error('Book ID in URL does not match book ID in data');
  }
  
  try {
    const apiUrl = await findWorkingApiEndpoint();
    await axios.put(`${apiUrl}/Books/${id}`, book);
    console.log(`Book with ID ${id} updated successfully`);
  } catch (error) {
    console.error(`Error updating book with ID ${id}:`, error);
    throw error;
  }
};

// Function to delete a book
export const deleteBook = async (id: number): Promise<void> => {
  try {
    const apiUrl = await findWorkingApiEndpoint();
    await axios.delete(`${apiUrl}/Books/${id}`);
    console.log(`Book with ID ${id} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting book with ID ${id}:`, error);
    throw error;
  }
};
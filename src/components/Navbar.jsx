import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

function Navbar() {
  const { user, logout } = useAuthContext();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                MLM Platform
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user?.name || 'User'}</span>
                <button
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                  onClick={logout}
                >
                  <FaUserCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
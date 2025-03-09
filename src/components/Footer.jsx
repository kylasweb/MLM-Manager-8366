function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-4 text-center">
      <div className="container mx-auto">
        <p>&copy; {year} Zocial MLM. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer; 
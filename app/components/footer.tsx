export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-gray-800">
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Made with{" "}
          <span className="text-red-500 inline-block animate-pulse">❤️</span>{" "}
          by{" "}
          <a
            href="https://github.com/bishnutosh-p"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
          >
            @bishnutosh-p
          </a>
        </p>
      </div>
    </footer>
  );
}
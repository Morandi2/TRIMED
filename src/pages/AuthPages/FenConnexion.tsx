import { ChevronLeftIcon } from "lucide-react";
import { Link } from "react-router";
import Connexion from "../../components/auth/Connexion";

function App() {
  return (
    
    <div className="App">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Retourner au Dashboard
        </Link>
      </div>
      <Connexion />
    </div>
  );
}

export default App;
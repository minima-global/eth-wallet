import { appContext } from "../../AppContext";
import { useContext } from "react";


const Activity = () => {
  const { _currentNavigation } =
    useContext(appContext);

  if (_currentNavigation !== "activity") {
    return null;
  }
  return (
    <div className="px-4 md:px-0">
      <h3 className="font-bold">Activities</h3>

      <ul className="mt-2">
        
      </ul>
    </div>
  );
};

export default Activity;

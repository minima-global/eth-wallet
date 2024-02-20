import { useContext } from "react";
import { appContext } from "../../AppContext";

const Activity = () => {
  const { _currentNavigation, _activities } = useContext(appContext);

  console.log(_activities);
  console.log(_currentNavigation);

  if (_currentNavigation !== "activity") {
    return null;
  }

  return (
    <div>
      <h3>Activities</h3>

      <ul>
        {_activities.map((a) => (
          <li>
            <h3>ID</h3>
            <p>{a.hash}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Activity;

import { createContext, useContext, useState, useEffect } from 'react';
import { getFarms } from '../services/farmService';

const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const [farms, setFarms] = useState([]);
  const [activeFarm, setActiveFarmState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setActiveFarm = (farm) => {
    setActiveFarmState(farm);
    if (farm) localStorage.setItem('activeFarmId', farm._id);
  };

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const data = await getFarms();
        setFarms(data);

        const savedId = localStorage.getItem('activeFarmId');
        const savedFarm = data.find((f) => f._id === savedId);
        setActiveFarmState(savedFarm || data[0] || null);
      } catch (error) {
        console.error('Failed to load farms:', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadFarms();
  }, []);

  return (
    <FarmContext.Provider value={{ farms, setFarms, activeFarm, setActiveFarm, loading }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => useContext(FarmContext);
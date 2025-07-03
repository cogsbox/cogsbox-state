"use client";
import { useMemo } from "react";
import "./FlyingCars.css"; // We'll create this file next

interface FlyingCarsProps {
  numberOfCars?: number;
}

export default function FlyingCars({ numberOfCars = 40 }: FlyingCarsProps) {
  const cars = useMemo(() => {
    const carData = [];

    // Define the two vertical "lanes" for the cars
    const topLaneY = 29; // 40vh from the top
    const bottomLaneY = 23; // 45vh from the top

    for (let i = 0; i < numberOfCars; i++) {
      // Randomly decide the car's speed and starting time
      const animationDuration = 14 + Math.random() * 8; // 7 to 15 seconds
      const animationDelay = Math.random() * 15; // 0 to 15 seconds delay

      // Assign the car to one of the two lanes
      const laneY = Math.random() < 0.5 ? topLaneY : bottomLaneY;

      // Add a tiny vertical offset so cars aren't perfectly on the same line
      const verticalOffset = 1; // -0.75vh to +0.75vh

      carData.push({
        id: `car-${i}`,
        style: {
          top: `${laneY + verticalOffset}vh`,
          animationDuration: `${animationDuration}s`,
          animationDelay: `${animationDelay}s`,
        },
      });
    }
    return carData;
  }, [numberOfCars]);

  return (
    <div aria-hidden="true" className="flying-cars-container ">
      {cars.map((car) => (
        <div
          key={car.id}
          className="flying-car"
          style={car.style as React.CSSProperties}
        />
      ))}
    </div>
  );
}

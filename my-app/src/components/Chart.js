import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
ChartJS.register(CategoryScale, LineElement, PointElement, LinearScale, Title, Tooltip, Legend);

const formatDate = (date) => {
  let monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

  let newDate = new Date(date);
  let formattedDate = newDate.getDate() + ' ' + monthNames[newDate.getMonth()];
  return formattedDate;
}

export const LineChart = ({historicalData, ticker}) => {
  return (
    <div>
      <div style={{width: '60vw'}}>
        <Line
          data={{
            labels : historicalData.map(data => formatDate(data.date)),
            datasets : [
              {
                label : ticker.name,
                data: historicalData.map(data => data.price),
                fill: true,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)"
              },
            ]
          }}
        />
      </div>
    </div>
  )
}

import {Line} from "react-chartjs-2";
import { 
    Chart as ChartJS,
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement,
    Title,
    Tooltip,
    Legend,
);


export const LineGraph = () => {

    const fakeData = {
        labels: [
            "Label 1",
            "Label 2",
            "Label 3",
            "Label 4",
        ],
        datasets: [
            {
                label: "Steps",
                data: [0, 9, 2, 3],
                borderColor: "rgb(75, 192, 192)",
            },
            {
                label: "Times Cried",
                data: [4, 5, 9, 12],
                borderColor: "red",
            }
        ]
    }

    const options = {};
    const data = fakeData;

    return (
        <Line options={options} data={data}/>
    )
}
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React helper functions
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ReportsHorizontalBarChart({ color, title, description, date, chart }) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (chart && chart.labels && chart.datasets) {
      setChartData({
        labels: chart.labels,
        datasets: chart.datasets.map((dataset) => ({
          ...dataset,
          borderWidth: 1,
          borderRadius: 4,
        })),
      });
    }
  }, [chart]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.x;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
      },
      y: {
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
      },
    },
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
        <MDBox>
          <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
            {title}
          </MDTypography>
          <MDBox display="flex" alignItems="center">
            <MDBox fontSize="lg" color={color === "light" ? "dark" : "white"}>
              <Icon fontSize="small" color="inherit">
                {color === "light" ? "visibility" : "visibility"}
              </Icon>
            </MDBox>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;{description}
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox display="flex" alignItems="center" mt={-4} mr={-1}>
          <MDBox mr={1}>
            <MDTypography variant="button" color="text">
              {date}
            </MDTypography>
          </MDBox>
          <MDBox
            width="4rem"
            height="4rem"
            bgColor={color === "light" ? "dark" : "white"}
            borderRadius="50%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color={color === "light" ? "white" : "dark"}
            fontSize="1.25rem"
            shadow="md"
          >
            <Icon color="inherit">bar_chart</Icon>
          </MDBox>
        </MDBox>
      </MDBox>
      <MDBox p={2}>
        <div style={{ height: "300px", position: "relative" }}>
          <Bar data={chartData} options={options} />
        </div>
      </MDBox>
    </Card>
  );
}

ReportsHorizontalBarChart.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ]),
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  date: PropTypes.string.isRequired,
  chart: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string),
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.number),
        backgroundColor: PropTypes.arrayOf(PropTypes.string),
        borderColor: PropTypes.arrayOf(PropTypes.string),
        borderWidth: PropTypes.number,
        borderRadius: PropTypes.number,
      })
    ),
  }).isRequired,
};

export default ReportsHorizontalBarChart;

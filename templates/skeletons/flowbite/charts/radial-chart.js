// Get the CSS variable --color-brand and convert it to hex for ApexCharts
  const getBrandColor = () => {
    // Get the computed style of the document's root element
    const computedStyle = getComputedStyle(document.documentElement);
    
    // Get the value of the --color-brand CSS variable
    return computedStyle.getPropertyValue('--color-fg-brand').trim() || "#1447E6";
  };

  const getWarningColor = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue('--color-warning').trim() || "#1447E6";
  };

  const getSuccessColor = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue('--color-success').trim() || "#1447E6";
  };
  const getNeutralSecondaryMediumColor = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue('--color-neutral-secondary-medium').trim() || "#1447E6";
  };
  

  const brandColor = getBrandColor();
  const warningColor = getWarningColor();
  const successColor = getSuccessColor();
  const neutralSecondaryMediumColor = getNeutralSecondaryMediumColor();

  const getChartOptions = () => {
    return {
      series: [90, 85, 70],
      colors: [brandColor, warningColor, successColor],
      chart: {
        height: "350px",
        width: "100%",
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
      },
      plotOptions: {
        radialBar: {
          track: {
            background: neutralSecondaryMediumColor,
          },
          dataLabels: {
            show: false,
          },
          hollow: {
            margin: 0,
            size: "32%",
          }
        },
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -23,
          bottom: -20,
        },
      },
      labels: ["To do", "In progress", "Done"],
      legend: {
        show: true,
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      yaxis: {
        show: false,
        labels: {
          formatter: function (value) {
            return value + '%';
          }
        }
      }
    }
  }

  if (document.getElementById("radial-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.querySelector("#radial-chart"), getChartOptions());
    chart.render();
  }

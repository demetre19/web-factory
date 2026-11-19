// Get the CSS variable --color-brand and convert it to hex for ApexCharts
  const getBrandColor = () => {
    // Get the computed style of the document's root element
    const computedStyle = getComputedStyle(document.documentElement);
    
    // Get the value of the --color-brand CSS variable
    return computedStyle.getPropertyValue('--color-fg-brand').trim() || "#1447E6";
  };

  const getBrandSecondaryColor = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue('--color-fg-brand-subtle').trim() || "#1447E6";
  };

  const brandColor = getBrandColor();
  const brandSecondaryColor = getBrandSecondaryColor();

  const options = {
    chart: {
      // add these lines to update the size of the chart
      height: 240,
      width: 240,
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: brandColor,
        gradientToColors: [brandColor],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 6,
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -26
      },
    },
    series: [
      {
        name: "Developer Edition",
        data: [1500, 1418, 1456, 1526, 1356, 1256],
        color: brandColor,
      },
      {
        name: "Designer Edition",
        data: [643, 413, 765, 412, 1423, 1731],
        color: brandSecondaryColor,
      },
    ],
    xaxis: {
      categories: ['01 February', '02 February', '03 February', '04 February', '05 February', '06 February', '07 February'],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      labels: {
        formatter: function (value) {
          return '$' + value;
        }
      }
    },
  }

  if (document.getElementById("size-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("size-chart"), options);
    chart.render();
  }

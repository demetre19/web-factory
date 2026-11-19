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
  // set the labels option to true to show the labels on the X and Y axis
  xaxis: {
    show: true,
    categories: ['01 Feb', '02 Feb', '03 Feb', '04 Feb', '05 Feb', '06 Feb', '07 Feb'],
    labels: {
      show: true,
      style: {
        fontFamily: "Inter, sans-serif",
        cssClass: 'text-xs font-normal fill-body'
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: true,
    labels: {
      show: true,
      style: {
        fontFamily: "Inter, sans-serif",
        cssClass: 'text-xs font-normal fill-body'
      },
      formatter: function (value) {
        return '$' + value;
      }
    }
  },
  series: [
    {
      name: "Developer Edition",
      data: [150, 141, 145, 152, 135, 125],
      color: brandColor,
    },
    {
      name: "Designer Edition",
      data: [43, 13, 65, 12, 42, 73],
      color: brandSecondaryColor,
    },
  ],
  chart: {
    sparkline: {
      enabled: false
    },
    height: "100%",
    width: "100%",
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
  legend: {
    show: false
  },
  grid: {
    show: false,
  },
  }

  if (document.getElementById("labels-chart") && typeof ApexCharts !== 'undefined') {
  const chart = new ApexCharts(document.getElementById("labels-chart"), options);
  chart.render();
  }

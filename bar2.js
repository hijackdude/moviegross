
 function archie() {
    return {
      rad: Math.PI / 180,
      
      init({min = 0, max, angle, height = 100, width = 100}) {
        this.angle = angle;
        this.gaugeMin = min;
        this.gaugeMax = max;
        this.height = height;
        this.width = width;
  
        this.centerX = ~~(width / 2);
        this.centerY = height / 2;
      },
  
      calculateAngle(value) {
        return value === 0
          ? -this.angle.start 
          : -this.angle.start + (value - this.gaugeMin) / (this.gaugeMax - this.gaugeMin) * this.angle.max;
      },
  
      generateArcString({ length, value, lineWidth, padding }) {
        if (!length || length < this.gaugeMin) {
          length = this.gaugeMin;
        } else if (length > this.gaugeMax) {
          length = this.gaugeMax;
        }
        
        // calculate radian values for angles
        const startRadAngle = this.calculateAngle(0) * this.rad;   
        const endRadAngle = this.calculateAngle(length) * this.rad;
        
        // generate outerArc radius and coordinates
        let outerArc = {
          radius: this.centerX - padding
        };
        outerArc.start = {
          x: this.centerX + outerArc.radius * Math.cos(startRadAngle),
          y: this.centerY + outerArc.radius * Math.sin(startRadAngle)
        };
        outerArc.end = {
          x: this.centerX + outerArc.radius * Math.cos(endRadAngle),
          y: this.centerY + outerArc.radius * Math.sin(endRadAngle)
        };
        
        // generate innerArc radius and coordinates
        let innerArc = {
          radius: outerArc.radius - ~~(lineWidth)
        };
        innerArc.start = {
          x: this.centerX + innerArc.radius * Math.cos(startRadAngle),
          y: this.centerY + innerArc.radius * Math.sin(startRadAngle)
        };
        innerArc.end = {
          x: this.centerX + innerArc.radius * Math.cos(endRadAngle),
          y: this.centerY + innerArc.radius * Math.sin(endRadAngle)
        };
            
        // Once the line passes the halfway point
        // the angle is being drawn along the outer relationship 
        // instead of the inner relationship.
        // This is toggled with the large-arc-flag
        let largeArcFlag = 1;
        if (length < (this.gaugeMax * (180 / this.angle.max))) {
          largeArcFlag = 0;
        } 
        return `M ${outerArc.end.x}, ${outerArc.end.y} ` +
              `A ${outerArc.radius}, ${outerArc.radius} 0 ${largeArcFlag} 0 ${outerArc.start.x}, ${outerArc.start.y} ` +
              `L ${innerArc.start.x}, ${innerArc.start.y} ` +
              `A ${innerArc.radius}, ${innerArc.radius} 0 ${largeArcFlag} 1 ${innerArc.end.x}, ${innerArc.end.y} ` +
              'z';
      },
      
      arcElement(params) {
        let newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        for (let key of Object.keys(params)) {
          newPath.setAttribute('data-' + key, params[key]);
        }
        newPath.setAttribute('class', 'circle-bar-arc');
        newPath.setAttribute('d', this.generateArcString(params));
        if (params.hover) {
          newPath.style.fill = 'rgba(0,0,0,0)';
          newPath.setAttribute('stroke-width', '3');
          newPath.setAttribute('stroke', 'rgba(0,0,0,0)');
        } else {
          newPath.style.fill = params.color;
        }
        return newPath;
      },
      
      arcLabel(params) {
        let newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        for (let key of Object.keys(params)) {
          newText.setAttribute('data-' + key, params[key]);
        }
        newText.setAttribute('class', 'circle-bar-labels');
        newText.setAttribute('text-anchor', 'end');
        newText.setAttribute('x', this.centerX - 4);
        newText.setAttribute('y', params.textPadding);
        newText.textContent = params.label;
        newText.style.fill = params.color;
        return newText;
      }, 
      
      lineElement(angle) {
        const radAngle = this.calculateAngle(angle) * this.rad;
        const outer = {
          radius: this.centerX + 2
        };
        outer.x = this.centerX + outer.radius * Math.cos(radAngle);
        outer.y = this.centerY + outer.radius * Math.sin(radAngle);
        const inner = {
          radius: outer.radius - 100
        };
        inner.x = this.centerX + inner.radius * Math.cos(radAngle);
        inner.y = this.centerY + inner.radius * Math.sin(radAngle);
        
        const lineString = `M ${inner.x}, ${inner.y} ` +
               `L ${outer.x}, ${outer.y}`;
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', lineString);
        line.setAttribute('data-type', 'line');
        line.setAttribute('stroke', 'rgba(255, 255, 255, 1)');
        line.setAttribute('stroke-width', '3');
        return line;
      },
      
      updateCenter({target}) {
        
        let percent = document.getElementById('circleBarPercentage');
        let hours = document.getElementById('circleBarHours');
        let message = document.getElementById('circleBarMessage');
        
        if (target && target.dataset.length) {
          if (target.dataset.disabled === 'false') {
            percent.setAttribute('fill', target.dataset.color);
            percent.textContent = target.dataset.value ;
            percent.setAttribute('fill', target.dataset.color);
            hours.textContent = target.dataset.length + 'B';;
            hours.setAttribute('fill', target.dataset.color);
            message.textContent = '';
          } else {
            percent.textContent = '';
            hours.textContent = '';
            message.textContent = 'Disabled';
            message.setAttribute('fill', target.dataset.color);
          }
        } else {
          percent.textContent = '';
          hours.textContent = '';
        }
        
        // reduce opacity of other elements
        let chart = document.querySelector('#circleBar #arcs');
        for (let child of chart.children) {
          if (target
              && target.dataset.label 
              && child.dataset.label !== target.dataset.label
              && child !== percent
              && child !== hours
              && child !== message
              && child.dataset.type !== 'line'
             ) {
            child.style.opacity = .25;
          } else {
            child.style.opacity = 1;
          }
        }
      }
    }
  }
  
  const arcContainer = archie();
  arcContainer.init({
    angle: {
      start: 90,
      max: 240
    },
    min: 0, 
    max: 3,
    height: 250,
    width: 250,
  });
  
  let chart = document.getElementById('circleBar');
  let chartArcs = document.querySelector('#circleBar #arcs');
  let chartLines = document.querySelector('#circleBar #lines');
  let chartArcHovers = document.querySelector('#circleBar #arcHovers');
  
  let entries = [
    { label: 'Steven Spielberg',value: 7.4,length: 2.9, color: '#FD9983' },
    { label: 'Michael Bay', value: 6.6, length:2.3, color: '#FC9891' },
    { label: 'Peter Jackson', value: 7.8, length: 1.9, color: '#F79A9F' },
    { label: 'James Cameron', value: 7.9, length: 1.8, color: '#EF9DAB' },
    { label: 'Christopher Nolan', value: 8.3, length:  1.7, color: '#D0A8C0' },
    { label: 'Robert Zemeckis', value: 7.2, length: 1.72, color: '#E4A1B5', },
    { label: 'Chris Columbus', value:6.5, length: 1.73, color: '#D0A8C0',  },
    { label: 'Tim Burton', value: 7, length: 1.7, color: '#C1ADC3' },
    { label: 'David Yates', value:7.4, length:1.6, color: '#B4B1C3',  },
    { label: 'Ridley Scott', value: 6.9, length: 1.4, color: '#A9B5BF',  }
  ]
  
  const padding = 6;
  const lineWidth = 7;
  let i = 0;
  for (let entry of entries) {
    const params = {
      label: entry.label,
      length: entry.length,
      value: entry.value,
      lineWidth: lineWidth,
      padding: (padding + lineWidth) * i,
      textPadding: ((padding + lineWidth) * i) + lineWidth,
      color: entry.color, 
      disabled: entry.disabled ? entry.disabled : false
    }
    
    // add circle
    chartArcs.appendChild(arcContainer.arcElement(params));
    chartArcHovers.appendChild(arcContainer.arcElement(Object.assign({hover: true}, params)));
    
    // add text
    chartArcs.appendChild(arcContainer.arcLabel(params));
    
    // increment
    i++;
  }
  
  
  let percentage = document.getElementById('circleBarPercentage');
  percentage.setAttribute('x', 125);
  percentage.setAttribute('y', 122.5);
  
  let thing = document.getElementById('circleBarHours');
  thing.setAttribute('x', 125);
  thing.setAttribute('y', 135);
  
  let message = document.getElementById('circleBarMessage');
  message.setAttribute('x', 125);
  message.setAttribute('y', 129);
  
  chartLines.appendChild(arcContainer.lineElement((24/4) * 1));
  chartLines.appendChild(arcContainer.lineElement((24/4) * 2));
  chartLines.appendChild(arcContainer.lineElement((24/4) * 3));
  
  chart.addEventListener('mouseenter', arcContainer.updateCenter, true);
  chart.addEventListener('mouseleave', () => arcContainer.updateCenter({}), true);

  
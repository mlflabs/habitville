import React from 'react';
import { getByAltText } from '@testing-library/react';

export const NumberSvg  = ({number, color='#59d4de', height=64, width=64}:
  {number:number, color?: string, height?:number, width?:number}) => {

  const getSize = () => {
    if(number < 10) return '20px';
    if(number < 100) return '16px';
    return '12px';
  }

  const getX = () => {
    if(number < 10) return 13.4;
    if(number < 100) return 9;
    if(number < 1000) return 9;
    if(number < 10000) return 5;
    return 9;
  } 

  const getY = () => {
    if(number < 10) return 26.5;
    if(number < 100) return 25;
    if(number < 1000) return 24;
    if(number < 10000) return 24;
    return 20;
  } 

  //#fed833

  return (
    <svg
      version="1.1"
      viewBox="0 0 33.185101 33.185101"
      height={height}
      width={width}>
      <defs
        id="defs9648">
        <clipPath
          clipPathUnits="userSpaceOnUse"
          id="clipPath28">
          <path
            d="M 0,500 H 500 V 0 H 0 Z"
            id="path26"/>
        </clipPath>
        <clipPath
          clipPathUnits="userSpaceOnUse"
          id="clipPath3432">
          <path
            d="M 0,500 H 500 V 0 H 0 Z"
            id="path3430"/>
        </clipPath>
      </defs>
      <g
        transform="translate(-2.3062607,-3.0622128)"
        id="layer1">
        <g
          transform="matrix(0.35277777,0,0,-0.35277777,-28.002077,130.9093)"
          id="g22">
          <g
            id="g24"
            clip-path="url(#clipPath28)">
            <g
              id="g30"
              transform="translate(179.9814,315.3672)">
              <path
                d="m 0,0 c 0,-25.977 -21.058,-47.034 -47.034,-47.034 -25.976,0 -47.034,21.057 -47.034,47.034 0,25.976 21.058,47.034 47.034,47.034 C -21.058,47.034 0,25.976 0,0"
                style={{fill:color,
                        fillOpacity:1,
                        fillRule:'nonzero',
                        stroke:'none'}}
                id="path32"/>
            </g>
          </g>
        </g>
        <text
          y="27.308025"
          x="11.420301"
          style={{fontVariant: 'normal',
                  color: "#fff",
                  fontWeight: 900,
                  fontStretch:'normal',
                  fontSize: getSize(),
                  fillOpacity:1,
                  fillRule:'nonzero',
                  stroke:'none',
                  strokeWidth:'0.352777' } }
          id="text4292"><tspan
            style={{strokeWidth:'0.352777'}}
            x={getX()}
            y={getY()}
            id="tspan4290">{number}</tspan></text>
      </g>
    </svg>

  )
};


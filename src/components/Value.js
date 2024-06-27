import React from 'react'
import styled from 'styled-components'
import Heading from '../styling/Heading'
const Value = ({ data }) => {
    return (
        <Wrapper>

            <div className="value-card">
                <div className="value-item">
                    <div className="value-label">Velocity</div>
                    <div className="value">{data.velocity}m/s</div>
                </div>
                <div className="value-item">
                    <div className="value-label">Confidence</div>
                    <div className="value">{data.confidence}</div>
                </div>
                <div className="value-item">
                    <div className="value-label">Position X-coordinate</div>
                    <div className="value">{data.position.x} unit</div>
                </div>
                <div className="value-item">
                    <div className="value-label">Position Y-coordinate</div>
                    <div className="value">{data.position.y} unit</div>
                </div>
                <div className="value-item">
                    <div className="value-label">Movement Direction</div>
                    <div className="value">{data.direction}</div>
                </div>

            </div>
        </Wrapper>
    )
}


const Wrapper = styled.div`
background-color: #0e254a;
height: 100%;
display: flex;
justify-content: space-evenly;


/* ValueCard.css */
.value-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-radius: 8px;
  width: 300px; /* Adjust width as needed */
}

.value-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.value-label {
  font-weight: bold;
  margin-bottom: 4px;
  color: #4deeea;
}

.value {
  font-size: 20px;
  color: #2ecc71;
}


`
export default Value
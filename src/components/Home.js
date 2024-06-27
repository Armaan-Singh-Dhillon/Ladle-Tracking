import React from 'react'
import styled from "styled-components";
import Status from './Status'
import RadialChart from './RadialChart'
import Card from './Card'
import Value from './Value'


const Home = ({ objectData, status, latest }) => {
    const positionProps = {
        data: objectData,
        heading: "Real Time Coordinates",
        xKey: "timestamp",
        yKeys: [
            { key: "position.x", color: "#8884d8", name: "Position X" },
            { key: "position.y", color: "#82ca9d", name: "Position Y" }
        ]
    };
    const velocityProps = {
        data: objectData,
        heading: "Real Time Velocity",
        xKey: "timestamp",
        yKeys: [
            { key: "velocity", color: "#8884d8", name: "Velocity of Object" },
        ]
    };
    const data = [
        {
            name: "velocity",
            value: latest.velocity * 100,
            fill: "#2ecc71"
        },
        {
            name: "confidence",
            value: latest.confidence * 100,
            fill: "#4deeea"
        },
        {
            name: "Position X-coordinate",
            value: (latest.position != null) ? latest.position.x : 0,
            fill: "#82ca9d"
        },
        {
            name: "Position Y-coordinate",
            value: (latest.position != null) ? latest.position.y : 0,
            fill: "#8884d8"
        }
    ];

    return (
        <Wrapper>

            <div className='layout'>
                <div className='header'>
                    <div className='nav'>
                        <div className='nav-inner'>
                            Real Time Laddle Detection Monitoring
                        </div>
                    </div>
                    <Status status={status} heading="Laddle Status" />
                    <div className='coord'>

                        <Card {...positionProps} />
                    </div>


                    <div className='radial'>
                        <RadialChart data={data} />

                    </div>
                    <div className='val'>

                        <Value data={latest} />
                    </div>


                    <div className='velo'>
                        <Card {...velocityProps} />
                    </div>

                </div>

            </div>

        </Wrapper>
    )
}

const Wrapper = styled.div`
.bar{
  color: #4deeea;
}

.loader-container{
  display: flex;
  justify-content: space-evenly;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  height: 100vh;
}
.loading-spinner{
  width: 20%;
  height: 20%;
  background-color: rgba(255, 255, 255, 0.8);
  display:flex ;
  align-items: center;
  flex-direction: column;
  justify-content: space-evenly;
}
.spinner {
  border: 6px solid rgba(0, 0, 0, 0.1);
  border-left-color: #7983ff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  background-color: white;

}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.nav-inner{
  text-align: center;
  color: #4deeea;
}
.nav{
  background-color: #0e254a;
  display: flex;
  justify-content: space-evenly;
  font-size: 2.8rem;
}
.header{
  display: grid;
  grid-gap: 0.8rem;
  grid-template-columns: 0.35fr 0.8fr 0.6fr;
}

.nav{
  grid-column:1/-1;
}
.radial{
  grid-column:1/3;
  
}
.velo{
  grid-column:1/-1;
}
.coord{
  grid-column:2/-1;

}
.vals{
  grid-row: 3/4;
  grid-column: 1/2;
}

`
export default Home

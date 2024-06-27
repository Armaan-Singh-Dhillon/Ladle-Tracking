import React from 'react';
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import Heading from '../styling/Heading';
const RadialChart = ({ data }) => {
    return (
        <Wrapper>
            <Heading heading={"Radial Chart"} />

            <ResponsiveContainer width="100%" height={400}>
                <RadialBarChart
                    width={730}
                    height={300}
                    innerRadius="10%"
                    outerRadius="80%"
                    data={data}
                    startAngle={180}
                    endAngle={0}
                >
                    <RadialBar
                        minAngle={15}
                        label={{
                            fill: '#fff', // Label text color
                            position: 'insideStart', // Position of the label
                            fontSize: '12px',
                            fontWeight: 'bold',
                            formatter: (value) => `${value.toFixed(2)}` // Custom formatter for label text
                        }}
                        background
                        clockWise={true}
                        dataKey='value' // Assuming 'value' is the key for the data value
                    />
                    <Legend
                        iconSize={10}
                        width={120}
                        height={140}
                        layout='vertical'
                        verticalAlign='middle'
                        align="right"
                    />
                    <Tooltip />
                </RadialBarChart>
            </ResponsiveContainer>
        </Wrapper>

    );
};
const Wrapper = styled.div`
background-color: #0e254a;


`
export default RadialChart;

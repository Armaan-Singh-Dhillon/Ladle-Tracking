import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Heading from '../styling/Heading.js';
import styled from 'styled-components';
const Card = ({ data, heading, xKey, yKeys }) => {

    return <Wrapper>

        <Heading heading={heading} />
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <defs>
                    {yKeys.map((yKey, index) => (
                        <linearGradient key={`gradient-${index}`} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={yKey.color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={yKey.color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#888" />
                <XAxis
                    dataKey={xKey}
                    tick={{ fill: '#4deeea', fontSize: '12px' }} // Neon color for x-axis labels
                    tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
                />
                <YAxis tick={{ fill: '#4deeea', fontSize: '12px' }} /> {/* Neon color for y-axis labels */}
                <Tooltip
                    labelStyle={{ color: '#fff' }} // Neon color for tooltip labels
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Legend wrapperStyle={{ color: '#fff' }} /> {/* Neon color for legend labels */}
                {yKeys.map((yKey, index) => (
                    <Area
                        key={index}
                        type="monotone"
                        dataKey={yKey.key}
                        stroke={yKey.color}
                        fill={`url(#color${index})`} // Gradient fill based on the defined linear gradient
                        name={yKey.name}
                        dot={{ fill: '#fff' }} // Neon color for dots on the line
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    </Wrapper>


}
const Wrapper = styled.div`
background-color: #0e254a;


`
export default Card
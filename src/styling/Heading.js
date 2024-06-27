import React from 'react'
import styled from 'styled-components'
const Heading = ({ heading }) => {
  return (
    <Wrapper>
      <div className='heading-outer'>
        <div>
          {heading}
        </div>
      </div>

    </Wrapper>
  )
}

const Wrapper = styled.div`

.heading-outer{
  display: flex;
  justify-content: space-evenly;
  font-size: 1.2rem;
  color: #4deeea;
}


`
export default Heading
import React from 'react'
import styled from 'styled-components'
import { Link } from "react-router-dom";
import jsl from '../assets/JSL-Black-1.jpg'
import nit from '../assets/nit.png'
const Navbar = () => {
    return (
        <Wrapper>
            <div className='nav-outer'>
                <div className='image-outer'>

                    <Link to={"/"} className="links ">

                        <img src={jsl} alt="" className='jsl' />
                    </Link>
                </div>
                <div className='link-container'>

                    <Link to={"/"} className="links">

                        Real Time Monitoring
                    </Link>
                </div>
                <div className='link-container'>
                    <Link to={"/stop"} className="links">

                        stoppage report
                    </Link>
                </div>
                <div >
                    <Link to={"/"} className="links">

                        <img src={nit} alt="" className='nit' />
                    </Link>
                </div>
            </div>
        </Wrapper>
    )
}

const Wrapper = styled.div`
color: #4deeea;

.image-outer{
    width: 20%;
}
.jsl{
    width: 100%;
    object-fit: cover;
}
.nit{
    width: 80px;
}
.nav-outer{
    display: flex;
    justify-content: space-between;
}
  .links {
    text-decoration: none;
    color: #4deeea;
  }
.link-container{
        display: flex;
    align-items: center;
}

`
export default Navbar

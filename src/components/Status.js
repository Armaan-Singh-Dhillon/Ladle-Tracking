import styled from "styled-components"
import Heading from "../styling/Heading";


const Status = ({ status, heading }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Moving':
        return 'status-online';
      case 'Stopped':
        return 'status-offline';
      default:
        return 'status-error';
    }
  };
  return (
    <Wrapper>
      <div className={`${getStatusColor()}`} >
        <Heading heading={heading} />

        <div className="status-card">

          <div className={`status-ring ${getStatusColor()}`}>
            <span className="status-text">{status}</span>
          </div>
        </div>
      </div>

    </Wrapper>
  )
}

const Wrapper = styled.div`
background-color: #0e254a;
width: 100%;
display: flex;
align-items: center;
justify-content: space-evenly;
/* StatusCard.css */
.status-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px; /* Adjust height as needed */
}

.status-ring {
  position: relative;
  width: 200px; /* Diameter of the ring */
  height: 200px; /* Diameter of the ring */
  border-radius: 50%;
  border: 10px solid #ccc; /* Default color for the ring */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-text {
  z-index: 1;
}

/* Ring colors based on status */
.status-online {
  border-color: #2ecc71; /* Green */
  color: #2ecc71; /* Text color */
}

.status-offline {
  border-color: #e74c3c; /* Red */
  color: #e74c3c; /* Text color */
}

.status-error {
  border-color: #f39c12; /* Orange */
  color: #f39c12; /* Text color */
}

.status-unknown {
  border-color: #95a5a6; /* Gray */
  color: #95a5a6; /* Text color */
}



`

export default Status
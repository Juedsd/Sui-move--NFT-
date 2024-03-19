import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@mysten/dapp-kit';
import './Css.css';

export function BasicNavbar() {
    return (
        <Navbar expand="lg" className="bg-body-tertiary nav">
            <Container className='nav'>
                <Navbar.Brand href="#">Sui Book</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/Market">Market</Nav.Link>
                        <Nav.Link as={Link} to="/Mint">Mint</Nav.Link>
                        <Nav.Link as={Link} to="/Transfer">Transfer</Nav.Link>
                        <Nav.Link as={Link} to="/MyAsset">MyAsset</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end nav-wallet">
                    <MyComponent />
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

function MyComponent() {
    return (
        <div style={{ padding: 20 }}>
            <ConnectButton />
        </div>
    );
}

export default BasicNavbar;
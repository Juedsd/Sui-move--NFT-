
import { MoveStruct } from '@mysten/sui.js/client';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MyCard } from './booknftlist';
import { useMemo, useState } from "react";
import {
    useCurrentAccount, useSuiClientQuery,
    useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";

const nfttype = "0xe5ff61371d7c5461f165477bb985741e01bc7bb01d867e439f0df6c4f6eaf0b5::book_nft::BookNFT";
const Marketid = "0x10e13e8c12c00a9ece39c9fdf1a546174a50eec7ab8ad64358207a358e53ad0b"
const cointype = "0x2::sui::SUI"

export const IniMyassetlist: React.FC = () => {
    const account = useCurrentAccount();
    if (!account) {
        return;
    }
    const { data: Allassetlist, refetch: refetchEvents } = useSuiClientQuery(
        "getOwnedObjects",
        {
            owner: account!.address,

        },
    );
    if (Allassetlist) {
        console.log("Allassetlist", Allassetlist);
    }

    return <TbMyassetlist
        data={Allassetlist}
        refetchEvents={refetchEvents}
    />;
}


interface ComponentCProps {

    data: any;
    refetchEvents: any;
}

const TbMyassetlist: React.FC<ComponentCProps> = ({ data, refetchEvents }) => {

    const account = useCurrentAccount();
    if (!account) {
        return;
    }
    const allnftidlist: [] = useMemo(() => {
        const calTasklist: [] = data?.data.map((obj: any) => {
            let nowfields = [obj.data.objectId] as any;
            return nowfields;
        });
        return calTasklist;
    }, [data]);
    const Allnftidlist = allnftidlist?.flat();
    console.log("Allnftidlist", Allnftidlist)

    const { data: bnftdatalist } = useSuiClientQuery(
        "multiGetObjects",
        {
            ids:
                Allnftidlist,
            options: {
                showContent: true,
            },
        },
    );

    const deNFTList = useMemo(() => {
        return (
            bnftdatalist
                ?.filter((i) => i.data?.content?.dataType === "moveObject")
                .map((obj) => {
                    let content = obj.data?.content as {
                        dataType: "moveObject";
                        fields: MoveStruct;
                        hasPublicTransfer: boolean;
                        type: string;
                    };
                    if (content.type == nfttype)
                        return content.fields as unknown as MyCard;
                })
        );
    }, [bnftdatalist]);
    const filteredData = deNFTList?.filter(item => item !== undefined);
    console.log("filteredData", filteredData)
    console.log("deNFTList", deNFTList)


    const [NFTData, setNFTData] = useState({} as MyCard);
    const [askPrice, setAskPrice] = useState('');
    const [NFTid, setNFTid] = useState('');
    const [show, setShow] = useState(false);
    const [bookdetail, setdetailShow] = useState(false);
    const { mutate: signAndExecuteTransactionBlock } =
        useSignAndExecuteTransactionBlock();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handledeClose = () => setdetailShow(false);
    const handledeShow = () => setdetailShow(true);

    const handleItemClick = (NFT: MyCard, option: string) => {
        console.log('NFT的 ID:', NFT);
        setNFTData(NFT);
        setNFTid(NFTData?.id.id)
        if (option === 'list') {
            handleShow();
        } else if (option === 'detail') {
            handledeShow();
        }

    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAskPrice(e.target.value);
    };
    const ListMyNFT = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const PACKAGE_ID = localStorage.getItem("packageId") as string;
        const MODULE_NAME = "marketplace";
        const USERTAKE_FUNCTION_NAME = "list";

        let txb = new TransactionBlock();
        let deNFTid = NFTData.id.id;

        txb.moveCall({
            target: `${PACKAGE_ID}::${MODULE_NAME}::${USERTAKE_FUNCTION_NAME}`,
            typeArguments: [
                nfttype,
                cointype,
            ],
            arguments: [
                txb.object(Marketid),
                txb.object(deNFTid),
                txb.pure.u64(askPrice),
            ],
        });
        txb.setSender(account!.address);

        signAndExecuteTransactionBlock(
            {
                transactionBlock: txb,
                options: {
                    showEvents: true,
                },
            },
            {
                async onSuccess(data) {
                    console.log("list nft success");
                    console.log(data);
                    alert("list nft success");
                    await refetchEvents();
                    handleClose();
                },
                onError() {
                    console.log("list nft error");
                    alert("list error");
                },
            }
        );

    };

    return (
        <Container className='page-container'>
            {
                filteredData?.map((item, index) => (

                    <div key={index} className='nftcard'>

                        <Card style={{ width: '12rem', height: '27rem' }} bg='light' border='primary'>
                            <Card.Img variant="top" src="../static/imgs/book.png" className='image-container' />
                            <Card.Body style={{ height: '2.5rem' }}>
                                <Card.Title className='title-t'>{item?.title}</Card.Title>
                            </Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroup.Item className='ellipsis'>author : {item?.author}</ListGroup.Item>
                                <ListGroup.Item>description : {item?.description}</ListGroup.Item>
                            </ListGroup>
                            <Card.Body>
                                <Button className='button-buy' variant="primary" onClick={() => handleItemClick(item!, 'list')}>List</Button>
                                <Button className='button-lease' variant="info" onClick={() => handleItemClick(item!, 'detail')}>detail</Button>
                            </Card.Body>
                        </Card>
                        <Modal size="lg" show={bookdetail} onHide={handledeClose} centered>
                            <Form>
                                <Modal.Header closeButton>
                                    <Modal.Title>Book detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextNFTID">
                                        <Form.Label column sm="2">
                                            NFT ID
                                        </Form.Label>
                                        <Col sm="10">
                                            <Form.Control plaintext readOnly defaultValue={NFTid} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextTitle">
                                        <Form.Label column sm="2">
                                            title
                                        </Form.Label>
                                        <Col sm="10">
                                            <Form.Control plaintext readOnly defaultValue={NFTData?.title} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextAuthor">
                                        <Form.Label column sm="2">
                                            author
                                        </Form.Label>
                                        <Col sm="10">
                                            <Form.Control plaintext readOnly defaultValue={NFTData?.author} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextDescription">
                                        <Form.Label column sm="2">
                                            description
                                        </Form.Label>
                                        <Col sm="10">
                                            <Form.Control plaintext readOnly defaultValue={NFTData?.description} />
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextContent">
                                        <Form.Label column sm="2">
                                            content
                                        </Form.Label>
                                        <Col sm="10">
                                            <Form.Control plaintext readOnly defaultValue={NFTData?.content} />
                                        </Col>
                                    </Form.Group>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handledeClose}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        </Modal>
                    </div>

                ))
            }
            {
                <Modal show={show} onHide={handleClose} centered>
                    <Form onSubmit={ListMyNFT}>
                        <Modal.Header closeButton>
                            <Modal.Title>List</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>

                            <Form.Group
                                className="mb-3"
                                controlId="exampleForm.ControlTextarea1"
                            >
                                <Form.Label>Ask price</Form.Label>
                                <Form.Control
                                    id="askprice"
                                    type="number"
                                    placeholder="price"
                                    aria-label="Disabled input example"
                                    value={askPrice}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" type='submit'>
                                List
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

            }

        </Container >
    );
}
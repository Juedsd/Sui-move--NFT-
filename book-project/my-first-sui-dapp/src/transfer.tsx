
import { MoveStruct } from '@mysten/sui.js/client';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MyCard } from './booknftlist';
import { useMemo, useState } from "react";
import {
    useCurrentAccount, useSuiClientQuery,
    useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";

const nfttype = "0xe5ff61371d7c5461f165477bb985741e01bc7bb01d867e439f0df6c4f6eaf0b5::book_nft::BookNFT";

export const IniTransfer: React.FC = () => {
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
    //筛选特定NFT
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
    //参数设置
    const [NFTid, setNFTid] = useState('');
    const [RecerveAddress, setRecerveAddress] = useState('');
    const [show, setShow] = useState(false);
    const { mutate: signAndExecuteTransactionBlock } =
        useSignAndExecuteTransactionBlock();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleItemClick = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleShow();
    }
    //记录表单数据
    const handleseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNFTid(e.target.value);
    };
    const handleipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRecerveAddress(e.target.value);
    };
    //调用合约的传输函数
    const Transfer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const PACKAGE_ID = localStorage.getItem("packageId") as string;
        const MODULE_NAME = "book_nft";
        const USERTAKE_FUNCTION_NAME = "transfer";

        let txb = new TransactionBlock();
        txb.moveCall({
            target: `${PACKAGE_ID}::${MODULE_NAME}::${USERTAKE_FUNCTION_NAME}`,
            arguments: [
                txb.object(NFTid),
                txb.pure.address(RecerveAddress),
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
                    console.log("transfer nft success");
                    console.log(data);
                    alert("transfer nft success");
                    await refetchEvents();
                    handleClose();
                },
                onError() {
                    console.log("transfer nft error");
                    alert("transfer error");
                },
            }
        );

    };

    return (
        <Container className='tr-container'>
            <div className='tr-head'>
                <span className='tr-head-name'>Transfer</span>
                <span className='tr-head-des'>Transfer your book</span>
            </div>
            <div className='transfer-box'>
                <Form onSubmit={handleItemClick}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Select NFT</Form.Label>
                        <Form.Select aria-label="Default select example" onChange={handleseChange} required>
                            {
                                filteredData?.map((item, index) => (
                                    <>
                                        <option key={index} value={item?.id.id}>{item?.id.id}</option>
                                    </>
                                ))
                            }
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Select the NFT you want to transfer
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Receive address</Form.Label>
                        <Form.Control type="text" placeholder="Enter Sui Address" value={RecerveAddress} onChange={handleipChange} required />
                        <Form.Text className="text-muted">
                            Select the NFT you want to transfer
                        </Form.Text>
                    </Form.Group>
                    <Button className='tr-button' variant="primary" type="submit" size="lg" >
                        Transfer
                    </Button>
                </Form>
            </div>
            {
                <Modal show={show} onHide={handleClose} centered>
                    <Form onSubmit={Transfer}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                <Form.Text className="text-muted">
                                    Are you sure you want to send
                                </Form.Text>
                                <Col sm="10">
                                    <Form.Control plaintext readOnly defaultValue={NFTid} />
                                </Col>
                                <Form.Text className="text-muted">
                                    to address
                                </Form.Text>
                                <Col sm="10">
                                    <Form.Control plaintext readOnly defaultValue={RecerveAddress} />
                                </Col>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" type='submit'>
                                Confirm
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            }
        </Container >
    );
}
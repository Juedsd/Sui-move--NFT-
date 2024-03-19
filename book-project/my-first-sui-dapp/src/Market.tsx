import { MoveStruct } from '@mysten/sui.js/client';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import $ from 'jquery';
import Card from 'react-bootstrap/Card';
import './Css.css';
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { BookNFTList, MyCard } from './booknftlist';
import { useEffect, useMemo, useState } from "react";
import {
  useCurrentAccount, useSuiClientQuery,
  useSuiClientQueries,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";

const Marketid = "0x10e13e8c12c00a9ece39c9fdf1a546174a50eec7ab8ad64358207a358e53ad0b"
const NFTTYPE = '0xe5ff61371d7c5461f165477bb985741e01bc7bb01d867e439f0df6c4f6eaf0b5::book_nft::BookNFT';
const cointype = "0x2::sui::SUI"


//初始化市场
export const IniMarketlist: React.FC = () => {

  const { data: BookMarketlist, refetch: refetchEvents } = useSuiClientQuery(
    "getDynamicFields",
    {
      parentId: Marketid as string,
    },
  );
  if (BookMarketlist) {
    console.log("BookMarketlist", BookMarketlist);
  }

  return <TbMarketlist
    data={BookMarketlist}
    Marketid={Marketid}
    refetchEvents={refetchEvents}
  />;
}

// 获取所有booklist
interface ComponentCProps {
  // 声明组件A的props类型
  data: any;
  Marketid: any;
  refetchEvents: any;
}

const TbMarketlist: React.FC<ComponentCProps> = ({ data, Marketid, refetchEvents }) => {

  const bookMarktypelist: [] = useMemo(() => {
    const calTasklist: [] = data?.data.map((obj: any) => {
      let nowfields = [obj.name.type, obj.name.value] as any;
      return nowfields;
    });
    return calTasklist;
  }, [data]);

  const bookNFTidlist: [] = useMemo(() => {
    const calTasklist: [] = data?.data.map((obj: any) => {
      let nowfields = [obj.objectId, obj.name.value] as any;
      return nowfields;
    });
    return calTasklist;
  }, [data]);


  let nowNFTlisttype = [] as any;
  if (bookMarktypelist) {
    console.log("bookMarktypelist", bookMarktypelist);
    bookMarktypelist.forEach((item) => {
      console.log("item####", item);
      const obj = {
        method: "getDynamicFieldObject",
        params: {
          parentId: Marketid as string,
          name: {
            type: item[0],
            value: item[1],
          }
        }
      };
      nowNFTlisttype.push(obj);
    });
    // console.log("nowNFTlisttype", nowNFTlisttype);
  }

  return <TbMarketlistRealId
    nowNFTlisttype={nowNFTlisttype}
    refetchEvents={refetchEvents}
    BookNFTidlist={bookNFTidlist}

  />;
}

interface ComponentDProps {
  // 声明组件A的props类型
  // tbTasklistDetail: any;
  nowNFTlisttype: any;
  refetchEvents: any;
  BookNFTidlist: any;
}
// 获取所有booklist 实际id
const TbMarketlistRealId: React.FC<ComponentDProps> = ({ nowNFTlisttype, refetchEvents, BookNFTidlist }) => {
  console.log("nowNFTlisttype", nowNFTlisttype);
  const { data: tbMarketlistDetails } = useSuiClientQueries({
    queries: nowNFTlisttype,
    combine: (result) => {
      return {
        data: result.map((res) => res.data),
      }
    }
  });

  if (tbMarketlistDetails) {
    console.log("tbTasklistDetails", tbMarketlistDetails);
  }

  return <TbMarketlistRealList
    dataDetails={tbMarketlistDetails}
    refetchEvents={refetchEvents}
    BookNFTidlist={BookNFTidlist}
  />;
}

interface ComponentEProps {
  // 声明组件A的props类型
  // tbTasklistDetail: any;
  dataDetails: any;
  refetchEvents: any;
  BookNFTidlist: any;
}
export const TbMarketlistRealList: React.FC<ComponentEProps> = ({ dataDetails, refetchEvents, BookNFTidlist }) => {

  const ayMarketItemidList: [] = useMemo(() => {
    const calMarketlist = dataDetails?.map((obj: any) => {
      let nowfields = [obj?.data?.content.fields.id];
      return nowfields;
    });
    return calMarketlist;
  }, [dataDetails]);

  if (ayMarketItemidList) {
    console.log("ayMarketItemidList", ayMarketItemidList);
  }
  ayMarketItemidList.forEach((item) => {
    console.log("item", item);
  });

  //获取商品数据
  console.log("BookNFTidlist", BookNFTidlist);
  const obooknftidlist = (BookNFTidlist && Array.isArray(BookNFTidlist)) ? BookNFTidlist.map((item: any) => item[1]) : [];
  console.log("obooknftidlist", obooknftidlist);
  const flatArray = ayMarketItemidList.flat();
  const DynamicObjectlist = flatArray.map((obj: any) => {
    if (obj && obj.id) {
      return obj.id;
    } else {
      return null;
    }
  });
  console.log("NFTidlist", DynamicObjectlist);
  const { data: multi, refetch: refetchDeMarketList } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids:
        DynamicObjectlist,
      options: {
        showContent: true,
      },
    },
  );
  const { data: bnftidlist } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids:
        obooknftidlist,
      options: {
        showContent: true,
      },
    },
  );
  console.log("bnftidlist", bnftidlist);
  const deTaskList = useMemo(() => {
    return (
      multi
        ?.filter((i) => i.data?.content?.dataType === "moveObject")
        .map((obj) => {
          let content = obj.data?.content as {
            dataType: "moveObject";
            fields: MoveStruct;
            hasPublicTransfer: boolean;
            type: string;
          };
          return content.fields as unknown as BookNFTList;
        })
    );
  }, [multi]);
  const deNFTList = useMemo(() => {
    return (
      bnftidlist
        ?.filter((i) => i.data?.content?.dataType === "moveObject")
        .map((obj) => {
          let content = obj.data?.content as {
            dataType: "moveObject";
            fields: MoveStruct;
            hasPublicTransfer: boolean;
            type: string;
          };
          return content.fields as unknown as MyCard;
        })
    );
  }, [bnftidlist]);
  console.log("deTaskList: ", deTaskList);
  console.log("deNFTList: ", deNFTList);
  console.log("multi: ", multi);

  //账户验证
  const account = useCurrentAccount();
  if (!account) {
    return;
  }


  //获取用户list的NFT
  const ListedData = deTaskList?.filter(item => item.owner === account!.address);
  //console.log("ListedData", ListedData);
  const ListnftidData = BookNFTidlist?.filter((item: any[]) => ListedData?.some(listedItem => listedItem.id.id === item[0]!));
  //console.log("ListnftidData", ListnftidData);
  const ListnftData = deNFTList?.filter(item => ListnftidData?.some((listedItem: any[]) => listedItem[1] === item.id.id));
  //console.log("ListnftData", ListnftData);


  //变量设置
  const [show, setShow] = useState(false);
  const [orderData, setorderData] = useState({} as BookNFTList);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [delist, setdelistShow] = useState(false);
  const [NFTData, setNFTData] = useState({} as MyCard);
  const [NFTid, setNFTid] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handledeClose = () => setdelistShow(false);
  const handledeShow = () => setdelistShow(true);
  const handleClick = (sectionId: number) => {
    setActiveSection(prevSectionId => (prevSectionId === sectionId ? null : sectionId));
  };

  //记录市场底价
  const minAskItem = deTaskList?.reduce((minItem: BookNFTList | null, currentItem: BookNFTList) => {
    if (!minItem || currentItem.ask < minItem.ask) {
      return currentItem;
    }
    return minItem;
  }, deTaskList[0]);
  const minAskValue = minAskItem ? minAskItem.ask / 1000000000 : 0;
  //查询钱包余额
  const { data: balance } = useSuiClientQuery(
    "getBalance",
    {
      owner: account!.address,
      coinType: cointype
    },
  );
  const { data: coinData, refetch: refetchCoinsList } = useSuiClientQuery(
    "getCoins",
    {
      owner: account!.address,
      coinType: cointype
    },
  );

  console.log("balance: ", balance);
  console.log("coinData: ", coinData);
  //寻找可用的coin
  function getusefulcoinid(ask: number) {
    let accurateCoinid = null;
    if (coinData && Array.isArray(coinData.data)) {
      for (const dataItem of coinData.data) {
        const balance = parseInt(dataItem.balance);
        const coinObjectId = dataItem.coinObjectId;
        if (!isNaN(balance) && typeof coinObjectId === 'string') {
          if (balance == ask) {
            accurateCoinid = coinObjectId;
          }
        }
      }
    } else {
      console.error("coinData is undefined or not an array");
    }
    return accurateCoinid;
  }

  const handleItemClick = (item: BookNFTList, NFT: MyCard, option: string) => {
    // 处理点击事件
    console.log('点击的订单:', item);
    console.log('NFT的 ID:', NFT);
    setIsButtonDisabled(true);
    setorderData(item);
    setNFTData(NFT);
    setNFTid(NFTData?.id.id)
    if (option === 'buy') {
      handleShow();
    } else if (option === 'delist') {
      handledeShow();
    }

  }

  const SplituseCoin = () => {
    let txb = new TransactionBlock();
    let sfbalance = true;
    if (balance?.totalBalance) {
      if (parseInt(balance?.totalBalance) < orderData?.ask) {
        sfbalance = false;
      }
    }
    if (sfbalance) {
      const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(orderData?.ask)]);
      txb.transferObjects([coin], txb.pure.address(account!.address));
      signAndExecuteTransactionBlock(
        {
          transactionBlock: txb,
          options: {
            showEffects: true,
          },
        },
        {
          async onSuccess(data) {
            console.log(data);
            alert("splitCoins success");
            await refetchEvents();
            await refetchCoinsList();
            setIsButtonDisabled(false);
          },
          onError() {
            alert("splitCoins error");
          },
        }
      );
    } else {
      alert("Insufficient balance");
    }
  }

  //购买
  const BuyandTakeNFT = () => {
    const PACKAGE_ID = localStorage.getItem("packageId") as string;
    const MODULE_NAME = "marketplace";
    const USERTAKE_FUNCTION_NAME = "buy_and_take";

    let txb = new TransactionBlock();
    let deNFTid = NFTData.id.id;
    let accoinid = null;
    accoinid = getusefulcoinid(orderData.ask);

    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${USERTAKE_FUNCTION_NAME}`,
      typeArguments: [
        NFTTYPE,
        cointype,
      ],
      arguments: [
        txb.object(Marketid),
        txb.object(deNFTid),
        txb.object(accoinid!),
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
          console.log("user buy nft success");
          console.log(data);
          alert("buy nft success");
          await refetchEvents();
          await refetchDeMarketList();
        },
        onError() {
          console.log("user buy nft error");
          alert("buy nft error");
        },
      }
    );


  };

  const DelistandTakeNFT = () => {
    const PACKAGE_ID = localStorage.getItem("packageId") as string;
    const MODULE_NAME = "marketplace";
    const USERTAKE_FUNCTION_NAME = "delist_and_take";

    let txb = new TransactionBlock();
    let detaskid = orderData.id.id;
    console.log("detaskid:", detaskid);
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${USERTAKE_FUNCTION_NAME}`,
      typeArguments: [
        NFTTYPE,
        cointype,
      ],
      arguments: [
        txb.object(Marketid),
        txb.object(NFTid),
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
          console.log("delist nft success");
          console.log(data);
          alert("delist nft success");
          await refetchEvents();
          await refetchDeMarketList();
          handleClose();
        },
        onError() {
          console.log("delist nft error");
          alert("delist nft error");
        },
      }
    );

  };

  //jq动画效果
  useEffect(() => {
    $(document).ready(function () {
      $("#mk-nav a").on("click", function () {
        var position = $(this).parent().position();
        var width = $(this).parent().width();
        $("#mk-nav .slide1").css({ opacity: 1, left: position.left, width: width! });
      });

      $("#mk-nav a").on("mouseover", function () {
        var position = $(this).parent().position();
        var width = $(this).parent().width();
        $("#mk-nav .slide2").css({ opacity: 1, left: position.left, width: width! }).addClass("squeeze");
      });

      $("#mk-nav a").on("mouseout", function () {
        $("#mk-nav .slide2").css({ opacity: 0 }).removeClass("squeeze");
      });

      var currentWidth = $("#mk-nav li:nth-of-type(3) a").parent("li").width();
      var current = $("li:nth-of-type(3) a").position();
      $("#mk-nav .slide1").css({ left: current.left, width: currentWidth! });
    });
  }, []);


  return (
    <><Container className='head-ms-container'>
      <Col>
        <Image className='head-ms-image' src="../static/imgs/book.png" thumbnail />
        <div className='img-h-text'>
          <p>
            <span className='nftname'>sui book</span>
            SUI-20 (Inscription)
          </p>
          <p>Inscription time: 2023/2/22 08:00 UTC</p>
        </div>
      </Col>
      <Col xs={6} md={4} className='datablock'>
        <div className='datablock-one'>
          Floor price: {minAskValue} SUI
        </div>
        <div className='datablock-one'>
          Total Volume: 0 SUI
        </div>
        <div className='datablock-one'>
          Holders: 1
        </div>
        <div className='datablock-one'>
          Total Supply: ------
        </div>
      </Col>
      <div className='slide-button'>
        <ul id="mk-nav">
          <li className="slide1"></li>
          <li className="slide2"></li>
          <li><a href="#" onClick={() => handleClick(1)}>Marketplace</a></li>
          <li><a href="#" onClick={() => handleClick(2)}>MyList</a></li>
        </ul>
      </div>
    </Container>
      <Container id="section1" style={{ width: '75%', display: activeSection === 1 ? 'block' : 'none' }}>
        <Container className='page-container'>
          {deTaskList?.map((item, index) => (
            <div key={index} className='nftcard'>
              {deNFTList && deNFTList[index] && (
                <Card style={{ width: '12rem', height: '27rem' }} bg='light' border='primary'>
                  <Card.Img variant="top" src="../static/imgs/book.png" className='image-container' />
                  <Card.Body style={{ height: '2.5rem' }}>
                    <Card.Title className='title-t'>{deNFTList[index].title}</Card.Title>
                  </Card.Body>
                  <ListGroup className="list-group-flush">
                    <ListGroup.Item>price : {item.ask / 1000000000}</ListGroup.Item>
                    <ListGroup.Item className='ellipsis'>author : {deNFTList[index].author}</ListGroup.Item>
                    <ListGroup.Item>description : {deNFTList[index].description}</ListGroup.Item>
                  </ListGroup>
                  <Card.Body>
                    <Button className='button-buy' variant="primary" onClick={() => handleItemClick(item, deNFTList[index], "buy")}>Buy</Button>
                    <Button className='button-lease' variant="info">lease</Button>
                  </Card.Body>
                </Card>
              )}
            </div>
          ))}
        </Container>
        {
          <Modal show={show} onHide={handleClose} centered>
            <Form >
              <Modal.Header closeButton>
                <Modal.Title>Confirm Order</Modal.Title>
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
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={SplituseCoin} >
                  Order
                </Button>
                <Button variant="primary" onClick={BuyandTakeNFT} disabled={isButtonDisabled}>
                  Buy
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        }
      </Container>
      <Container id="section2" style={{ width: '75%', display: activeSection === 2 ? 'block' : 'none' }}>
        <Container className='page-container'>
          {ListedData?.map((item, index) => (
            <div key={index} className='nftcard'>
              {ListnftData && ListnftData[index] && (
                <Card style={{ width: '12rem', height: '27rem' }} bg='light' border='primary'>
                  <Card.Img variant="top" src="../static/imgs/book.png" className='image-container' />
                  <Card.Body style={{ height: '2.5rem' }}>
                    <Card.Title className='title-t'>{ListnftData[index].title}</Card.Title>
                  </Card.Body>
                  <ListGroup className="list-group-flush">
                    <ListGroup.Item>price : {item.ask / 1000000000}</ListGroup.Item>
                    <ListGroup.Item className='ellipsis'>author : {ListnftData[index].author}</ListGroup.Item>
                    <ListGroup.Item>description : {ListnftData[index].description}</ListGroup.Item>
                  </ListGroup>
                  <Card.Body>
                    <Button className='button-delist' variant="danger" onClick={() => handleItemClick(item, ListnftData[index], "delist")}>Delist</Button>
                  </Card.Body>
                </Card>
              )}
            </div>
          ))}
        </Container>
      </Container>
      {
        <Modal show={delist} onHide={handledeClose} centered>
          <Form >
            <Modal.Header closeButton>
              <Modal.Title>Delist</Modal.Title>
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
              <Form.Group as={Row} className="mb-3" controlId="formPlaintextTitle">
                <Col sm="10">
                  <Form.Control plaintext readOnly defaultValue="Are you sure to delist this NFT?" />
                </Col>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handledeClose}>
                Close
              </Button>
              <Button variant="primary" onClick={DelistandTakeNFT}>
                Confirm
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      }
    </>
  );
}


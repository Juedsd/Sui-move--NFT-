import { TransactionBlock } from "@mysten/sui.js/transactions";
import React, { useState } from 'react';
import { Button, Container } from "@radix-ui/themes";
import {
  useSignAndExecuteTransactionBlock,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

export function CreateCounter({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const client = useSuiClient();
  const PackageId = useNetworkVariable("PackageId");
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  return (
    <>
      <Container>
        <Form onSubmit={create}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label>title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter book title"
                value={title}
                onChange={(e) => setTitle(e.target.value)} />
            </Form.Group>

            <Form.Group as={Col} controlId="formGridPassword">
              <Form.Label>author</Form.Label>
              <Form.Control type="text" value="author" disabled />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>book description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>book content</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)} />
          </Form.Group>

          <Button
            size="3"
            type="submit"
          >
            Create NFT
          </Button>
        </Form>

      </Container></>
  );

  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const txb = new TransactionBlock();

    txb.moveCall({
      target: `${PackageId}::book_nft::mint_to_sender`,
      arguments: [txb.pure.string(title), txb.pure.string(description), txb.pure.string(content), txb.pure.string("https://pic.616pic.com/ys_bnew_img/00/13/44/S1u5Y2obmQ.jpg")],
    });

    signAndExecute(
      {
        transactionBlock: txb,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      },
      {
        onSuccess: (tx) => {
          client
            .waitForTransactionBlock({
              digest: tx.digest,
            })
            .then(() => {
              const objectId = tx.effects?.created?.[0]?.reference?.objectId;

              if (objectId) {
                onCreated(objectId);
              }
            });
        },
      },
    );
  }
}

import React, { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { saveAs } from 'file-saver';
import "bootstrap/dist/css/bootstrap.min.css";
import "prismjs/themes/prism.css";
import SyntaxHighlighter, { Prism } from 'react-syntax-highlighter';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState("");

    async function processData(response: Response) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let data = "";
        let connectLine = ""
        while (true) {
            if(!reader) return;
            const { value, done } = await reader.read();
            if (done) {
                break;
            }
            data += decoder.decode(value, { stream: true });
            if (data.includes("\n")) {
                console.log(data)

                setResult(data)
                const lines = data.split("\n")
                data = lines.pop() as string; // 保存最后一个不完整的行
                // for (const line of lines) {
                //
                // }
            }
        }
    }

    async function fetchData(formData: FormData) {
        const response = await fetch("http://localhost:8000/process", {
            method: "POST",
            body: formData, // 假设 formData 包含一个要发送的文件
        });
        if (response.ok) {
            await processData(response);
        } else {
            console.error("Error fetching data:", response.statusText);
        }
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                await fetchData(formData);
            } catch (error) {
                console.error("Error uploading and processing the file:", error);
            }
        } else {
            console.error("No file selected");
        }
    };

    // @ts-ignore
    function DownloadDocument({ result }) {
        const handleDownload = () => {
            const date = new Date();
            const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
            const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            saveAs(blob, `document_${dateString}.docx`);
        };

        return (
                <button onClick={handleDownload}>下载文档</button>
        );
    }

    return (
        <Container>
            <Row className="mt-5">
                <Col>
                    <Card>
                        <Card.Header>文件上传</Card.Header>
                        <Card.Body>
                            <Form onSubmit={onSubmit}>
                                <Form.Group controlId="formFile">
                                    <Form.Label>选择文件</Form.Label>
                                    <Form.Control type="file" onChange={onFileChange} required />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    上传并处理
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card>
                        <Card.Header>处理结果</Card.Header>
                        <Card.Body>
                            <SyntaxHighlighter language="java" >
                                {result}
                            </SyntaxHighlighter>
                        </Card.Body>

                        <DownloadDocument result={result} />
                    </Card>

                </Col>
            </Row>
        </Container>
    );
}

export default App;

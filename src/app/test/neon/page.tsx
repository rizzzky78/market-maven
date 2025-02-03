"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

export default function KeyValueStorePage() {
  const [email, setEmail] = useState("");
  const [chatId, setChatId] = useState("");
  const [value, setValue] = useState("{}");
  const [retrieveKey, setRetrieveKey] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [retrievedValue, setRetrievedValue] = useState<any>(null);

  const handleStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setRetrievedValue(null);

    try {
      // Validate JSON input
      const parsedValue = JSON.parse(value);
      const key = uuidv4();

      const response = await fetch("/api/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          metadata: {
            chatId,
            email,
          },
          value: parsedValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to store value");
      }

      setStatus({
        type: "success",
        message: `Successfully stored value with key: ${key}`,
      });
      setRetrieveKey(key);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setRetrievedValue(null);

    try {
      const response = await fetch(`/api/store?key=${retrieveKey}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve value");
      }

      setRetrievedValue(data);
      setStatus({
        type: "success",
        message: "Successfully retrieved value",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Store Value</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStore} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mb-2"
              />
              <Input
                placeholder="Chat ID"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                required
                className="mb-2"
              />
              <Textarea
                placeholder="Value (JSON object)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="font-mono"
                rows={5}
              />
            </div>
            <Button type="submit">Store Value</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retrieve Value</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRetrieve} className="space-y-4">
            <Input
              placeholder="Enter key (UUID)"
              value={retrieveKey}
              onChange={(e) => setRetrieveKey(e.target.value)}
              required
            />
            <Button type="submit">Retrieve Value</Button>
          </form>
        </CardContent>
      </Card>

      {status && (
        <Alert variant={status.type === "success" ? "default" : "destructive"}>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      {retrievedValue && (
        <Card>
          <CardHeader>
            <CardTitle>Retrieved Value</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-secondary p-4 text-xs rounded-lg overflow-auto">
              {JSON.stringify(retrievedValue, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

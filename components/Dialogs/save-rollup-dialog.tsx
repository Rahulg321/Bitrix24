"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface RollupDialogProps {
  onSave: (name: string, description: string) => void;
}

export default function SaveRollupDialog({ onSave }: RollupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name, description);
    setName("");
    setDescription("");
    setOpen(false);
  };

  // Detect mobile vs desktop
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="secondary">Save Rollup</Button>
        </DrawerTrigger>
        <DrawerContent className="p-4 space-y-4">
          <DrawerHeader>
            <DrawerTitle>Create Rollup</DrawerTitle>
          </DrawerHeader>
          <Input
            placeholder="Rollup Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleSave} className="w-full">
            Save
          </Button>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Save Rollup</Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Create Rollup</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Rollup Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={handleSave} className="w-full">
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}

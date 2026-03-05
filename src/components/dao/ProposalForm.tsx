import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const governorAbi = [
  "function propose(address[] targets,uint256[] values,bytes[] calldatas,string description) returns (uint256)",
];

export const ProposalForm = () => {
  const [targets, setTargets] = useState("");
  const [values, setValues] = useState("");
  const [calldatas, setCalldatas] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      if (!(window as any).ethereum) {
        alert("No wallet found. Please install MetaMask or a compatible wallet.");
        return;
      }

      const governorAddress = import.meta.env.VITE_GOVERNOR_ADDRESS as string | undefined;
      if (!governorAddress) {
        alert("VITE_GOVERNOR_ADDRESS is not set in your frontend environment.");
        return;
      }

      setSubmitting(true);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const governor = new ethers.Contract(governorAddress, governorAbi, signer);

      const targetArray = targets
        .split(",")
        .map((addr) => addr.trim())
        .filter(Boolean);

      const valueArray = values
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => ethers.parseEther(v));

      const calldataArray = calldatas
        .split(",")
        .map((cd) => cd.trim())
        .filter(Boolean)
        .map((cd) => (cd.startsWith("0x") ? cd : ethers.hexlify(ethers.toUtf8Bytes(cd))));

      if (targetArray.length === 0 || targetArray.length !== valueArray.length || targetArray.length !== calldataArray.length) {
        alert("Targets, values, and calldatas must have the same non-zero length.");
        setSubmitting(false);
        return;
      }

      const tx = await governor.propose(targetArray, valueArray, calldataArray, description);
      const receipt = await tx.wait();

      const proposalId = receipt?.logs?.[0]?.args?.proposalId ?? "(unknown)";
      alert(`Proposal created with id: ${proposalId.toString()}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create proposal. See console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Target addresses (comma-separated)</label>
        <Input
          type="text"
          value={targets}
          onChange={(e) => setTargets(e.target.value)}
          placeholder="0x...,0x..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Values in ETH (comma-separated)</label>
        <Input
          type="text"
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder="0,0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Calldatas (comma-separated hex)</label>
        <Textarea
          value={calldatas}
          onChange={(e) => setCalldatas(e.target.value)}
          placeholder="0x...,0x..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Increase matching radius to 6km"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating proposal..." : "Create Proposal"}
      </Button>
    </form>
  );
};

export default ProposalForm;


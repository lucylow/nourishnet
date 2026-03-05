import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const governorAbi = [
  "function castVote(uint256 proposalId,uint8 support) returns (uint256)",
];

export const VotePanel = () => {
  const [proposalId, setProposalId] = useState("");
  const [support, setSupport] = useState<"0" | "1" | "2">("1");
  const [submitting, setSubmitting] = useState(false);

  const handleVote = async (e: React.FormEvent) => {
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

      const id = proposalId.trim();
      if (!id) {
        alert("Proposal id is required.");
        return;
      }

      setSubmitting(true);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const governor = new ethers.Contract(governorAddress, governorAbi, signer);

      const tx = await governor.castVote(id, Number(support));
      await tx.wait();
      alert("Vote submitted.");
    } catch (err) {
      console.error(err);
      alert("Failed to cast vote. See console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleVote} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Proposal ID</label>
        <Input
          type="text"
          value={proposalId}
          onChange={(e) => setProposalId(e.target.value)}
          placeholder="e.g. 1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Support</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={support}
          onChange={(e) => setSupport(e.target.value as "0" | "1" | "2")}
        >
          <option value="0">Against</option>
          <option value="1">For</option>
          <option value="2">Abstain</option>
        </select>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting vote..." : "Cast Vote"}
      </Button>
    </form>
  );
};

export default VotePanel;


import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProposalForm from "@/components/dao/ProposalForm";
import VotePanel from "@/components/dao/VotePanel";

const Dao = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto py-10 space-y-10">
      <section className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">NourishNet DAO</h1>
        <p className="text-muted-foreground">
          Token holders can propose and vote on changes to agent parameters, minter roles, and treasury allocations.
          Connect your wallet in your browser and interact with the on-chain governor contract.
        </p>
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Proposal</h2>
          <p className="text-sm text-muted-foreground">
            Specify the target contracts, ETH values, and encoded calldata for each action, plus a human-readable
            description. Governance token holders will be able to vote on the resulting proposal.
          </p>
          <ProposalForm />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vote on Proposal</h2>
          <p className="text-sm text-muted-foreground">
            Enter a proposal id and choose whether to vote for, against, or abstain. Your voting power is based on your
            delegated governance token balance at the proposal snapshot block.
          </p>
          <VotePanel />
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Dao;


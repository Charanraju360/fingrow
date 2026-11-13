import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Please sign in to run simulations" }, { status: 401 });
    }

    const { action, scenarioType, initialBalance = 50000, parameters = {}, runId, stepAction, amountDelta = 0, outcomeMessage = "", isCompleted = false } = await request.json();

    if (action === "start") {
      const validScenarios = ["first_salary", "monthly_budget", "investment_challenge", "sip_growth", "startup_builder"];
      if (!validScenarios.includes(scenarioType)) {
        return NextResponse.json({ error: "Invalid scenario type" }, { status: 400 });
      }

      const run = db.simulations.startRun(session.userId, scenarioType, initialBalance, parameters);
      return NextResponse.json({ success: true, run });
    } else if (action === "step") {
      if (!runId || !stepAction) {
        return NextResponse.json({ error: "runId and stepAction are required" }, { status: 400 });
      }

      const updated = db.simulations.recordStep(runId, stepAction, amountDelta, outcomeMessage, isCompleted);
      if (!updated) {
        return NextResponse.json({ error: "Simulation run not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, run: updated });
    } else {
      return NextResponse.json({ error: "Invalid action. Expected 'start' or 'step'" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Simulation run error", err);
    return NextResponse.json({ error: "Failed to process simulation" }, { status: 500 });
  }
}


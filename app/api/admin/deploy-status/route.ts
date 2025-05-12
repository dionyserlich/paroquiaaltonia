import { NextResponse } from "next/server"
import { getGithubConfig, isGithubConfigured } from "@/app/utils/githubConfig"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sha = searchParams.get("sha")

    if (!sha) {
      return NextResponse.json({ error: "SHA do commit não fornecido" }, { status: 400 })
    }

    // Obter configuração do GitHub
    const config = getGithubConfig()

    // Verificar se o GitHub está configurado
    if (!isGithubConfigured(config)) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "GitHub não configurado. Configure as variáveis de ambiente GITHUB_OWNER, GITHUB_REPO e GITHUB_TOKEN.",
        },
        { status: 500 },
      )
    }

    // Verificar o status do commit
    const commitResponse = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/commits/${sha}`, {
      headers: {
        Authorization: `token ${config.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!commitResponse.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: `Erro ao verificar commit: ${commitResponse.status} ${commitResponse.statusText}`,
        },
        { status: 500 },
      )
    }

    const commitData = await commitResponse.json()

    // Verificar se há workflows em execução para este commit
    const workflowsResponse = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/actions/runs?head_sha=${sha}`,
      {
        headers: {
          Authorization: `token ${config.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    if (!workflowsResponse.ok) {
      // Se não conseguir verificar workflows, assumimos que o commit foi bem-sucedido
      // já que o commit existe
      return NextResponse.json({
        status: "success",
        message: "Alterações aplicadas com sucesso",
        commit: {
          sha: commitData.sha,
          message: commitData.commit.message,
          url: commitData.html_url,
        },
      })
    }

    const workflowsData = await workflowsResponse.json()

    // Se não houver workflows, consideramos o deploy concluído
    if (workflowsData.total_count === 0) {
      return NextResponse.json({
        status: "success",
        message: "Alterações aplicadas com sucesso",
        commit: {
          sha: commitData.sha,
          message: commitData.commit.message,
          url: commitData.html_url,
        },
      })
    }

    // Verificar o status dos workflows
    const workflows = workflowsData.workflow_runs
    const pendingWorkflows = workflows.filter((wf: any) => wf.status !== "completed")
    const failedWorkflows = workflows.filter((wf: any) => wf.status === "completed" && wf.conclusion !== "success")

    if (failedWorkflows.length > 0) {
      return NextResponse.json({
        status: "error",
        message: "Um ou mais workflows falharam",
        workflows: failedWorkflows.map((wf: any) => ({
          name: wf.name,
          status: wf.status,
          conclusion: wf.conclusion,
          url: wf.html_url,
        })),
      })
    }

    if (pendingWorkflows.length > 0) {
      return NextResponse.json({
        status: "pending",
        message: `${pendingWorkflows.length} workflow(s) em andamento...`,
        workflows: pendingWorkflows.map((wf: any) => ({
          name: wf.name,
          status: wf.status,
          url: wf.html_url,
        })),
      })
    }

    // Se todos os workflows foram concluídos com sucesso
    return NextResponse.json({
      status: "success",
      message: "Deploy concluído com sucesso",
      commit: {
        sha: commitData.sha,
        message: commitData.commit.message,
        url: commitData.html_url,
      },
      workflows: workflows.map((wf: any) => ({
        name: wf.name,
        status: wf.status,
        conclusion: wf.conclusion,
        url: wf.html_url,
      })),
    })
  } catch (error: any) {
    console.error("Erro ao verificar status do deploy:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Erro desconhecido ao verificar status do deploy",
      },
      { status: 500 },
    )
  }
}

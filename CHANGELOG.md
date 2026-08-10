# Changelog

All notable changes to the Trix TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0](https://github.com/trixdb/trix-sdk-typescript/compare/v0.1.1...v1.0.0) (2026-08-10)


### ⚠ BREAKING CHANGES

* **relationships:** relationships.update/delete/reinforce/weaken now take (sourceId, targetId, type, ...) instead of (relationshipId, ...); ReinforceParams.amount is replaced by boost/context; UpdateRelationshipParams no longer accepts relationshipType.
* **utils:** removes the never-wired metrics/telemetry/logging exports (Logger, setupLogging, getLogger, log*, *Collector, RequestTimer, set/getMetricsCollector, startRequestTimer, recordRetry, createRequestMetrics, configureTelemetry, createRequestSpan, traced, withTracing, and the Telemetry/ Span/Metrics types) plus the @opentelemetry/api peer dependency.
* **sdk:** Billing, Jobs resources removed. Agent, Sessions, Clusters resources have reduced API surface.

### Features

* add architectureReview method and ArchitectureReviewResult type ([484bc97](https://github.com/trixdb/trix-sdk-typescript/commit/484bc979e3b28282c20337fcbeb5d11c6bdca97a))
* add batchScanCode and analyzeCodeComplexity to GitHubResource ([bbbacbb](https://github.com/trixdb/trix-sdk-typescript/commit/bbbacbb1e7b0e6a0cc5109a33bd3194f805e233d))
* add code health and agent PR methods to TypeScript SDK ([c20306d](https://github.com/trixdb/trix-sdk-typescript/commit/c20306d79bf56c45b4b6369769c9c01bfca802b1))
* add ConflictError for HTTP 409 responses ([d5cd246](https://github.com/trixdb/trix-sdk-typescript/commit/d5cd2465354cc83620a2606cf0b099fee125658a))
* add correlation ID header to all API requests ([01f3dd6](https://github.com/trixdb/trix-sdk-typescript/commit/01f3dd669b91b636438d7489c64f0661d4333e6d))
* add crews, files, hubs, templates resources and bot stream types ([830f3a8](https://github.com/trixdb/trix-sdk-typescript/commit/830f3a8c8dca0faa395fbbf5bd881fad36ea16f0))
* add explainCode, suggestRefactoring, buildAstQuery to TypeScript SDK ([7dac26f](https://github.com/trixdb/trix-sdk-typescript/commit/7dac26f6afe9b3b607d4e8837fa67ff09017d59b))
* add file size validation and FileSizeError ([7d84c1e](https://github.com/trixdb/trix-sdk-typescript/commit/7d84c1ef39d4d0ccf5cc083f81179abdf2fe0b0d))
* add getActiveBranches to TypeScript SDK — BranchInfo + ActiveBranchesResult types ([4db7f60](https://github.com/trixdb/trix-sdk-typescript/commit/4db7f60d1daf0a44b04bd8ae805547c20d7be9f2))
* add getCleanCode() to TypeScript SDK ([d876073](https://github.com/trixdb/trix-sdk-typescript/commit/d876073b0f213a62f1d1dd5958014b55d283c4f6))
* add getDesignPatterns() to TypeScript SDK ([f0a305c](https://github.com/trixdb/trix-sdk-typescript/commit/f0a305c9b05fc852864becf37407140873125554))
* add getFunctionProfile() to TypeScript SDK (CQL mode 77) ([cbcc346](https://github.com/trixdb/trix-sdk-typescript/commit/cbcc34616dd9485235134a0f78709476171cb5d8))
* add getFunctionRiskDelta method (CQL mode 81) ([5b4145e](https://github.com/trixdb/trix-sdk-typescript/commit/5b4145e282f4fd11290d9aaf4342ce8b49a533c3))
* add getGoalProgressHistory + GoalProgressEvent/GoalProgressHistoryResponse types ([8cdc924](https://github.com/trixdb/trix-sdk-typescript/commit/8cdc92440c8840a87a7f92d7c143a9772f9fe934))
* add getHotspotMatrix to TypeScript SDK (iter 38) ([dd4b496](https://github.com/trixdb/trix-sdk-typescript/commit/dd4b496539ec6c247c8261bb7476c240d6754b44))
* add getModuleCohesion method (CQL mode 80) ([71a8197](https://github.com/trixdb/trix-sdk-typescript/commit/71a819784e6e6a0320530208dbe71c00bee15a64))
* add getModuleSmellHeat to TypeScript SDK (iter 40) ([b123670](https://github.com/trixdb/trix-sdk-typescript/commit/b1236707e485c203283ca58b80584623acc79b29))
* add getRefactorPriority to TypeScript SDK (iter 39) ([e1eef97](https://github.com/trixdb/trix-sdk-typescript/commit/e1eef974c2e1c7d525241c055f2a56e40169c19c))
* add getSmellTrend + getCouplingAnalysis to TypeScript SDK (iter 37) ([f182b68](https://github.com/trixdb/trix-sdk-typescript/commit/f182b685f6562f09b3ef0bf6b27fdcd8a3fa259d))
* add getTestability + getApiSurface methods (CQL modes 78-79) ([9002138](https://github.com/trixdb/trix-sdk-typescript/commit/9002138a4825ee0946c8faeb5c2374042fa71f48))
* add getTestability() — CQL mode 78 ([265ba82](https://github.com/trixdb/trix-sdk-typescript/commit/265ba8258dc7211ea97328e2f2c23ca78d069007))
* add getTopRules to TypeScript SDK (iter 41) ([0542641](https://github.com/trixdb/trix-sdk-typescript/commit/0542641fa48eae2c13fa5cf7a224bf52ea60612d))
* add getToxicFiles + evaluateQualityGate TypeScript SDK methods ([d9486a1](https://github.com/trixdb/trix-sdk-typescript/commit/d9486a18bcecaa1186e5218dd47a366b23856d6f))
* add goals and habits SDK resources (ADR-034/035) ([85232a2](https://github.com/trixdb/trix-sdk-typescript/commit/85232a220df28b2b478e4f1ebcedf18984eb27e4))
* add habits, skills, and space config resources to TypeScript SDK ([9bab9c3](https://github.com/trixdb/trix-sdk-typescript/commit/9bab9c34b9de9a2e7568adba0fa1399553185e26))
* Add image memory support to TypeScript SDK ([495de15](https://github.com/trixdb/trix-sdk-typescript/commit/495de1500fe8dd934171808f3e4d0cd67708e089))
* add origin context fields to types ([c19dab8](https://github.com/trixdb/trix-sdk-typescript/commit/c19dab8b18dd060c63a498a4e3cd0519a4a8a53e))
* add Phase 4 SDK methods — daily notes, templates, AI (ADR-065) ([c4e5d0a](https://github.com/trixdb/trix-sdk-typescript/commit/c4e5d0a564dda25504efe889cbf7fe2d2a7cffd9))
* add pinning, protection, topics, quality, multi-scale support ([a0c6dcc](https://github.com/trixdb/trix-sdk-typescript/commit/a0c6dcca43ebe347198d4fb075c906b9964c4abe))
* add preFlightPR method and PreFlightPRResult type ([aa7aa5d](https://github.com/trixdb/trix-sdk-typescript/commit/aa7aa5de1217d883637a03cf08fe5abd40230223))
* add preset resources to TypeScript SDK (ADR-103) ([85ff716](https://github.com/trixdb/trix-sdk-typescript/commit/85ff716023e7c35068a091f281301e0309d6adf7))
* add PRFileMetric type to PRReviewResult ([f0500d2](https://github.com/trixdb/trix-sdk-typescript/commit/f0500d2d2682ff72a16aea758d6de213b15301bf))
* Add Resources API support and memory-resource linking ([968f4c2](https://github.com/trixdb/trix-sdk-typescript/commit/968f4c202754558138340cd8e604f7e7a26f226b))
* add reviewPRCode — AST-level PR code review with quality score and grade ([4dc08a0](https://github.com/trixdb/trix-sdk-typescript/commit/4dc08a07045ff419cdad945f2747174e527c1a1d))
* add scanCode() method + ScanCodeResult type to TypeScript SDK ([eb51524](https://github.com/trixdb/trix-sdk-typescript/commit/eb51524ac6b93760824d428e9444aacf648d4359))
* add security_hotspots to CqlFromMode ([c4493e3](https://github.com/trixdb/trix-sdk-typescript/commit/c4493e3f85a00708aacdc0bdf0e586c2c0b9aca2))
* add submitPRReview and checkPRQualityGate — SDK parity for PR submission and quality gates ([72bc764](https://github.com/trixdb/trix-sdk-typescript/commit/72bc764d00807734b7ee280e61ec02781c07327d))
* add task assignments, checkpoints, and handoff to TypeScript SDK ([9f559ca](https://github.com/trixdb/trix-sdk-typescript/commit/9f559ca0469412d0e9f6486a0cf6d6686202f408))
* add webhooks.verifySignature for inbound webhook verification ([#32](https://github.com/trixdb/trix-sdk-typescript/issues/32)) ([923836e](https://github.com/trixdb/trix-sdk-typescript/commit/923836e8a8c02b3944c82f9fe52f7c7ce2dc8e16))
* add workflow resource to TypeScript SDK (ADR-061 Phase 5) ([28badb0](https://github.com/trixdb/trix-sdk-typescript/commit/28badb06e97dabe1742127df23ba77966f4ebdb0))
* **ADR-109a:** add Agent.resolvePipeline() to TypeScript SDK (tick 79) ([2c6c381](https://github.com/trixdb/trix-sdk-typescript/commit/2c6c381c6ac751421d9ec33b199a980e2dbf0c22))
* **ADR-143:** add Trix.ping() health check to TypeScript SDK ([dca23e1](https://github.com/trixdb/trix-sdk-typescript/commit/dca23e1bc55abd7a6de8f0ebce16b774a85cfd2f))
* agent E2E test suite + agent stream types ([ebbd079](https://github.com/trixdb/trix-sdk-typescript/commit/ebbd0791d514b19560eaeae5bee47c36eae030f1))
* **bots:** add Bots resource and bot types ([b6de4cb](https://github.com/trixdb/trix-sdk-typescript/commit/b6de4cb8e387748d0fff09ba123c13f674fa1fdb))
* **ci:** add release please automation for automated changelogs ([efcd889](https://github.com/trixdb/trix-sdk-typescript/commit/efcd889c5303fae9f4fc7e2cb1f869c128d81062))
* **code:** add analyzeContributorQuality() to TypeScript SDK (CQL mode 84) ([5cd35ba](https://github.com/trixdb/trix-sdk-typescript/commit/5cd35ba24b5c80bcdfd5c84d130647bbd69a89cc))
* **code:** add findDeadCode() to TypeScript SDK (CQL mode 83) ([cf6c001](https://github.com/trixdb/trix-sdk-typescript/commit/cf6c0010be467bbfbf6dba42be32a1c2f5a49562))
* **code:** add getAbstractionQuality() to TypeScript SDK (CQL mode 85) ([d15f83b](https://github.com/trixdb/trix-sdk-typescript/commit/d15f83b2afe91cbd359d372b27e01b2c106f9db4))
* **code:** add getFunctionOutliers() to TypeScript SDK (CQL mode 82) ([5f5eea8](https://github.com/trixdb/trix-sdk-typescript/commit/5f5eea8051c3289f9b980c362df65cacb6ff09b5))
* **cql:** add refactor_candidates to CqlFromMode type ([dcbe3ab](https://github.com/trixdb/trix-sdk-typescript/commit/dcbe3ab07f53147c73b648bee11f3dc888d627ca))
* expand CqlFromMode and CqlQuery types for new CQL modes ([410a53f](https://github.com/trixdb/trix-sdk-typescript/commit/410a53f477e86f304df82218f58c1d746f709bff))
* expand CqlQuery type with all 12 from: modes and full field set ([de0b498](https://github.com/trixdb/trix-sdk-typescript/commit/de0b4985d173828919f5a153dea600aa14f9ae47))
* export new code-analysis types from SDK index ([900a41c](https://github.com/trixdb/trix-sdk-typescript/commit/900a41c15bfbeecf750c0255a1e531b3a8a7dc54))
* **github:** add 6 new code analysis methods + types ([cffb43f](https://github.com/trixdb/trix-sdk-typescript/commit/cffb43fffc2ac5ee78d750789e4049bc41cc59f7))
* **github:** add agent_quality_scores + human_avg_quality to AgentAttributionResponse ([e0ce4b0](https://github.com/trixdb/trix-sdk-typescript/commit/e0ce4b0a7f14ce4ee7c8a9b025523c59ebb256fd))
* **github:** add AgentAuditResult types + getAgentAuditTrail method ([966d0c4](https://github.com/trixdb/trix-sdk-typescript/commit/966d0c40780c651b1e367e09d17db2f8f68a7aa2))
* **github:** add ApprovedPR types and getApprovedPRs method ([8e4ecf4](https://github.com/trixdb/trix-sdk-typescript/commit/8e4ecf4f405e7ff108357fc2c11cdb78f42a70b3))
* **github:** add AssigneeCycleTimeResult types + getAssigneeCycleTime method ([4ccb112](https://github.com/trixdb/trix-sdk-typescript/commit/4ccb11269de42678f5372dfc8e912ec549a40a3d))
* **github:** add ContributorMomentumResult types, getContributorMomentum, fix getIssueCycleTime ([dd05ce3](https://github.com/trixdb/trix-sdk-typescript/commit/dd05ce31f174783292cc62e2396c2ae53c2cb7b1))
* **github:** add CycleTimeTrendResult + getCycleTimeTrend (Phase 4) ([d2c5d05](https://github.com/trixdb/trix-sdk-typescript/commit/d2c5d054a0b04268d02055d385a67be8c5f4a1c6))
* **github:** add getIssueFlow() method and IssueFlowDay/IssueFlowResult types ([d4b52e3](https://github.com/trixdb/trix-sdk-typescript/commit/d4b52e300ffec0d687eb065a189e772eb00fed82))
* **github:** add getIssueTriage() method and TriageIssue types ([d12bc9d](https://github.com/trixdb/trix-sdk-typescript/commit/d12bc9d1cf947f59484a98a2c2923b2d8457b897))
* **github:** add getPrQualityTrend — 12-week PR quality score trend ([c8f8818](https://github.com/trixdb/trix-sdk-typescript/commit/c8f8818aea065ddc93e42bc6124e03c178a5994a))
* **github:** add getPrSizeDistribution to TypeScript SDK (ADR-152) ([566f0cf](https://github.com/trixdb/trix-sdk-typescript/commit/566f0cf343414b69b617c2062bcca400c36b22ea))
* **github:** add getReviewTurnaround to TypeScript SDK (ADR-152) ([5b4ca54](https://github.com/trixdb/trix-sdk-typescript/commit/5b4ca545ea8a48cd5245152e1e22c3ba87e63779))
* **github:** add issue cycle time types and getIssueCycleTime method (Phase 4) ([d5d15d8](https://github.com/trixdb/trix-sdk-typescript/commit/d5d15d8749e5d806a138b2f73e2e6a84a6b104b0))
* **github:** add issueBacklog + reviewCoverage to HealthSnapshotResponse ([020e204](https://github.com/trixdb/trix-sdk-typescript/commit/020e2045170351b63247489eff85bd66b26f374c))
* **github:** add IssueBacklogResult types and getIssueBacklog method ([db94989](https://github.com/trixdb/trix-sdk-typescript/commit/db94989e6fc499cf25ed9bb7ed931022bce66b8b))
* **github:** add issueFlow field to HealthSnapshotResponse ([a97f43c](https://github.com/trixdb/trix-sdk-typescript/commit/a97f43c2a4533a173371af78abc8a351045cd60c))
* **github:** add IssueResolversResult + getIssueResolvers + MilestoneStat.predictedDate ([4dfbc32](https://github.com/trixdb/trix-sdk-typescript/commit/4dfbc32a900daff24c872cd52b02d0ef16f8e2e3))
* **github:** add issueThroughput + slowestCycleLabel to HealthSnapshotResponse ([3588d63](https://github.com/trixdb/trix-sdk-typescript/commit/3588d6351e7514b0e1233e4bd9a6984a56758eaf))
* **github:** add IssueThroughputResult + getIssueThroughput (Phase 4) ([b751a1b](https://github.com/trixdb/trix-sdk-typescript/commit/b751a1b460d605ca4ff3d9ac3ffa4ed7eb65c6c0))
* **github:** add minQualityScore/maxQualityScore to getPrBriefs ([67be4c3](https://github.com/trixdb/trix-sdk-typescript/commit/67be4c381574514cd95e3db2917b2175d5b34386))
* **github:** add prQualityTrend, reviewTurnaround, urgentItems to HealthSnapshotResponse ([c883d43](https://github.com/trixdb/trix-sdk-typescript/commit/c883d43bce6d5f9e17ffabbb27f4eb5e0a4221ed))
* **github:** add requestedReviewers + hasReview to OpenPRAging type ([e87ad47](https://github.com/trixdb/trix-sdk-typescript/commit/e87ad47c649b4ee1d6f67ed858e6c52fa881b444))
* **github:** add ReviewCoverageResult types and getReviewCoverage method ([ea9f686](https://github.com/trixdb/trix-sdk-typescript/commit/ea9f686a414eb19a76f1b453eec0439fe32ed16e))
* **github:** add reviewsGiven + approvals to ContributorQualityStat type ([b9b8ff5](https://github.com/trixdb/trix-sdk-typescript/commit/b9b8ff5f5f6d380f6fc004c6513fdae52bb2f20e))
* **github:** add ScopeCreepResult types + getScopeCreep method ([4ff6248](https://github.com/trixdb/trix-sdk-typescript/commit/4ff6248de1bb4744ecf5a0adbbcf72cfb8a0728e))
* **github:** add SecurityFinding type to PRReviewResult ([a68128f](https://github.com/trixdb/trix-sdk-typescript/commit/a68128fc649e3c7735bb14a41736df3a39d4b7f6))
* **github:** add WorkQueueResult types and getWorkQueue() method (ADR-152) ([aa6eddd](https://github.com/trixdb/trix-sdk-typescript/commit/aa6edddf5dfc8bfd8860bddf80f9043a88cb1cd5))
* **github:** AssigneeStat + IssueAssigneesResult types; getIssueAssignees() method ([236ac05](https://github.com/trixdb/trix-sdk-typescript/commit/236ac05450ac7e9dbbb7ce49122c3d107bb066ec))
* **github:** CommitLeader + CommitLeadersResult types; getCommitLeaders() method ([6ab5c8e](https://github.com/trixdb/trix-sdk-typescript/commit/6ab5c8e84aad415b10e4557a7ab35ddce5abe3c4))
* **github:** getAIvsHumanQuality — AI vs human code quality comparison ([1e5d7d8](https://github.com/trixdb/trix-sdk-typescript/commit/1e5d7d8aa01392051d88cdfb017f0f4aea740de3))
* **github:** getBusFactor — knowledge concentration risk (ADR-152) ([669de60](https://github.com/trixdb/trix-sdk-typescript/commit/669de60f7807f71ea3284318d0c63bda421a0967))
* **github:** getDORAMetrics — DORA engineering excellence metrics ([776181a](https://github.com/trixdb/trix-sdk-typescript/commit/776181a9d0f9463f933ea0e0dc27427857407af8))
* **github:** getPRTaskAlignment — detect semantic drift between PRs and linked issues ([dcc2554](https://github.com/trixdb/trix-sdk-typescript/commit/dcc25541fdd638073aea692b7bf745dcb4907fd0))
* **github:** getReviewDepth — reviewer thoroughness analytics ([4c77769](https://github.com/trixdb/trix-sdk-typescript/commit/4c77769c66bee32190f99080c0c1a2b79b9af639))
* **github:** getReviewNetwork — team code review collaboration graph (ADR-152) ([d1ff321](https://github.com/trixdb/trix-sdk-typescript/commit/d1ff321c9374981e0846eaef991d81f12c58fe3d))
* **github:** getTestGap method — test coverage gap endpoint (ADR-152) ([8d3cfb4](https://github.com/trixdb/trix-sdk-typescript/commit/8d3cfb417aa9ac229a7683a45e83f74338f9fd36))
* **github:** LabelVelocity + LabelVelocityResult types; getLabelVelocity() method ([40975fe](https://github.com/trixdb/trix-sdk-typescript/commit/40975fed22bb3c94a00d3289051f3db9ea425335))
* **github:** MilestoneStat + MilestonesResult types; getMilestones() method ([9230889](https://github.com/trixdb/trix-sdk-typescript/commit/9230889dba365d1db3ec0dd6306574c5d7ab7249))
* **github:** ReviewerWorkloadResult + getReviewerWorkload method ([c6cc41e](https://github.com/trixdb/trix-sdk-typescript/commit/c6cc41e453f0a2d061fbc259df3ddf50ca770df8))
* **github:** update ReleaseReadinessResponse types — richer structure (blockers, hotspots, stale PRs) ([6823615](https://github.com/trixdb/trix-sdk-typescript/commit/6823615442cc344ef651416d19025978d1a33826))
* **P10:** TypeScript SDK account-default pipeline methods ([ee40c2c](https://github.com/trixdb/trix-sdk-typescript/commit/ee40c2c32cde2b34f1f2606398599b72619f2d53))
* **P10:** TypeScript SDK space-default pipeline methods ([cbb1038](https://github.com/trixdb/trix-sdk-typescript/commit/cbb10386afc030b3b76cdf74a1fa884aa56b0381))
* **P10:** TypeScript SDK trigger methods for session/mega/scoped ([e852e51](https://github.com/trixdb/trix-sdk-typescript/commit/e852e5188fd320397dc2c6355e837241e006ff83))
* **personas:** add persona resources to TypeScript SDK (ADR-043) ([df4b6f1](https://github.com/trixdb/trix-sdk-typescript/commit/df4b6f1ed551b22b8c3c02011e2f7d24fb2e58fc))
* PRReviewResult gains qualityScore field (0-100) ([1b08db8](https://github.com/trixdb/trix-sdk-typescript/commit/1b08db8f66bb047d31734101cc9d88af24935331))
* **sdk-ts:** add 6 new code health methods + types (session 15-16 parity) ([f44ab72](https://github.com/trixdb/trix-sdk-typescript/commit/f44ab72bd3efcd8ddae33155a27579d359c730b9))
* **sdk-ts:** add getComplexityTrend, getContributorRisk, getSmellDensity, prePRChecklist (iter 34) ([b896ebb](https://github.com/trixdb/trix-sdk-typescript/commit/b896ebb2e8260c1ef60483ae7625ab43b9e6bf8e))
* **sdk-ts:** add getHealthSnapshot method + HealthSnapshotResponse type ([98dc3e0](https://github.com/trixdb/trix-sdk-typescript/commit/98dc3e0d2698aff990cb28bbe7794911f6a92bf1))
* **sdk-ts:** add getNamingViolations ([88cb66d](https://github.com/trixdb/trix-sdk-typescript/commit/88cb66d3fb381416f05338a3a5388588bc96581b))
* **sdk-ts:** add getPrBriefs method + PRBrief/PRBriefsResponse types ([6820f57](https://github.com/trixdb/trix-sdk-typescript/commit/6820f5791c6659d0f06fb47524ce63a7b74f46e3))
* **sdk-ts:** add getProjectHealthScore + getTestSmell (iter 36) ([d8ffb89](https://github.com/trixdb/trix-sdk-typescript/commit/d8ffb89258f6c68665162b7abd3160534cae8233))
* **sdk-ts:** add getReviewStats + getWeeklyActivity to GitHubResource ([020e40c](https://github.com/trixdb/trix-sdk-typescript/commit/020e40cd37e884628f399e13d102efdf04123a80))
* **sdk-ts:** add getSolidAnalysis — SOLID principle violations + OOP anti-patterns ([519b8df](https://github.com/trixdb/trix-sdk-typescript/commit/519b8df93fa12deb9aa65bcbc013b36eb4952345))
* **sdk-ts:** add getTechDebt method and TechDebtResult types ([a18007d](https://github.com/trixdb/trix-sdk-typescript/commit/a18007dbc71e74ce2e9e7c285e4c11da64e91559))
* **sdk-ts:** add GitHubResource — ADR-152 Phases 1–2 ([99d3589](https://github.com/trixdb/trix-sdk-typescript/commit/99d35896f2f368cab9caebad7104283b454cf3ab))
* **sdk-ts:** add new CQL modes to CqlFromMode type (24 modes) ([c48d75a](https://github.com/trixdb/trix-sdk-typescript/commit/c48d75a5c1324dfe13e29e920762c8c41ce8fddc))
* **sdk-ts:** add Phase 5 methods to GitHubResource + extract types ([e0bf0ed](https://github.com/trixdb/trix-sdk-typescript/commit/e0bf0eddaefce9ae6d661e586c0458df8a70c8e0))
* **sdk-ts:** add prUrl field to PRBrief interface ([5f95ae8](https://github.com/trixdb/trix-sdk-typescript/commit/5f95ae89b6b7e0c109584d5fb01d3063332d385b))
* **sdk-ts:** add score to QualityGate + lastScannedAt to CodeSummaryResult ([6c61e14](https://github.com/trixdb/trix-sdk-typescript/commit/6c61e140a4b22ec3b6f91b0dacffc11d7b82cf38))
* **sdk-ts:** custom rule CRUD — listCustomRules/createCustomRule/updateCustomRule/deleteCustomRule/testCustomRule ([f3486d5](https://github.com/trixdb/trix-sdk-typescript/commit/f3486d5b1120399e367200eac65e2796e60bd906))
* **sdk-ts:** file_path filter + createIssueFromSuggestion ([f5d02e8](https://github.com/trixdb/trix-sdk-typescript/commit/f5d02e87ea33e79f36067ab735bbdd009abd129f))
* **sdk-typescript:** add batch_search, knowledge, store_and_organize, suggest_strategy ([c31b224](https://github.com/trixdb/trix-sdk-typescript/commit/c31b224900cafe86a9dc531b50fd0315b06129ce))
* **sdk-typescript:** add task management support (ADR-033) ([17b5025](https://github.com/trixdb/trix-sdk-typescript/commit/17b5025dde60334b00adfe7fb346cec3714665e4))
* **sdk/ts:** agent filter param for getPrBriefs ([230302e](https://github.com/trixdb/trix-sdk-typescript/commit/230302e37768e9b46d8200de45e133304471c995))
* **sdk:** add avgMergeDays to ContributorQualityStat ([0eccc6e](https://github.com/trixdb/trix-sdk-typescript/commit/0eccc6e1a04ebea229429328f0db016990ce9d48))
* **sdk:** add deadCodeRatio method (CQL mode 87) ([3ee1db8](https://github.com/trixdb/trix-sdk-typescript/commit/3ee1db84dbb5bac7fd6e1e41e3201ce064027871))
* **sdk:** add DepVuln type + update PRReviewResult with depVulns/inlineComments/unsupportedFiles ([3f8fc2e](https://github.com/trixdb/trix-sdk-typescript/commit/3f8fc2e36a9bb314c6040a696b2060e3fb7074cb))
* **sdk:** add getContributorQuality to TypeScript SDK ([59f2654](https://github.com/trixdb/trix-sdk-typescript/commit/59f265455efece059a8dccd625a3064ed00c665f))
* **sdk:** add getPrAging to TypeScript SDK ([15d60f7](https://github.com/trixdb/trix-sdk-typescript/commit/15d60f7ec94a4901eb4c608181d1871cbeabed98))
* **sdk:** add getWeekOverWeek — 7-day velocity comparison ([5083ed7](https://github.com/trixdb/trix-sdk-typescript/commit/5083ed795bfa58a80e844100f5bb8108a7c929f7))
* **sdk:** add note link and memory methods (ADR-065 Phase 3) ([def9f61](https://github.com/trixdb/trix-sdk-typescript/commit/def9f6193d23587b164747ff193df138a6057455))
* **sdk:** add Notes resource with types for ADR-065 ([9391822](https://github.com/trixdb/trix-sdk-typescript/commit/93918229f1b6b90fc868a88755b57877c6c08e44))
* **sdk:** add scopeAnalysis method (CQL mode 86) ([eccf1f1](https://github.com/trixdb/trix-sdk-typescript/commit/eccf1f1ccaba91722d34dbe4b4084002d9877250))
* **sdk:** centralize camelCase→snake_case + CSV array query serialization ([5511c18](https://github.com/trixdb/trix-sdk-typescript/commit/5511c18a76b3b611429fbdb4bc761f4a5640a10e))
* **spaces:** add slug support and getBySlug method ([ef71721](https://github.com/trixdb/trix-sdk-typescript/commit/ef7172160a45f32e14eecbbc093668e1bb0770b8))
* **types:** add agent field to PRBrief ([d8930b9](https://github.com/trixdb/trix-sdk-typescript/commit/d8930b9a641d3ee5397c169b2e34e9c41418752a))
* **types:** add DesignFinding type and design field to AnalyzeCodeComplexityResult ([1e0b43d](https://github.com/trixdb/trix-sdk-typescript/commit/1e0b43dd7059a33384918db00c50cd5a711c8df3))
* **types:** add file_report to CqlFromMode ([82619e4](https://github.com/trixdb/trix-sdk-typescript/commit/82619e477c691b28ce1c68c71a7b010394f4f16f))
* **types:** add FunctionComplexityMetric + enrich FileComplexityMetric ([7706c34](https://github.com/trixdb/trix-sdk-typescript/commit/7706c347efe7d91b41a80bd8e41f3b284a82e9d0))
* **types:** Add pipeline param to ListMemoriesParams ([#1](https://github.com/trixdb/trix-sdk-typescript/issues/1)) ([ecdd416](https://github.com/trixdb/trix-sdk-typescript/commit/ecdd416fd38fff5060938cb8b868970b1742d25a))
* **types:** add symbols to CqlFromMode ([4526856](https://github.com/trixdb/trix-sdk-typescript/commit/45268566fc75e0a7fadfb2578783ae63e5b5a444))
* **types:** add tech_debt to CqlFromMode union ([af95474](https://github.com/trixdb/trix-sdk-typescript/commit/af954746d62988095da71bbbdd95bfdb020c258f))
* **types:** add trend to CqlFromMode ([7628d87](https://github.com/trixdb/trix-sdk-typescript/commit/7628d879b44e1b07c82e32e54b72b08a6bd32e36))
* **types:** add worst_functions to CqlFromMode ([ee90e00](https://github.com/trixdb/trix-sdk-typescript/commit/ee90e004e01e1e0921721cb64027a792911f213a))
* **typescript-sdk:** add audio/video transcription features with diarization ([d063be6](https://github.com/trixdb/trix-sdk-typescript/commit/d063be69df7af4f43f39b5f08f7f0aeed2add6a0))
* **typescript-sdk:** add calendar resource (ADR-075 Phase 3) ([b4eb526](https://github.com/trixdb/trix-sdk-typescript/commit/b4eb52619ed5fbca1cfbc4091697e2b0b6d88ab6))
* **typescript-sdk:** add graph expansion with hybrid scoring ([aa1bfde](https://github.com/trixdb/trix-sdk-typescript/commit/aa1bfde561efd371ea21c31612ed2eafe946c654))
* **types:** support 'in' operator array values in CqlQuery.where ([3272213](https://github.com/trixdb/trix-sdk-typescript/commit/32722139493c897857645514933fde6143b2e75b))


### Bug Fixes

* add ArchitectureReviewResult to main import block ([344185e](https://github.com/trixdb/trix-sdk-typescript/commit/344185e423054969bf3fbbb8be1370503ff6e884))
* add max size guard to streamToArrayBuffer to prevent resource exhaustion ([2853a45](https://github.com/trixdb/trix-sdk-typescript/commit/2853a45d81a9a828cc0cf898f56b764ddaea22f6))
* add try/finally for stream reader lock release ([4451f6a](https://github.com/trixdb/trix-sdk-typescript/commit/4451f6adf3367ecdcf3e966a27d18c8c5267d5d6))
* Align SDK with API for examples compatibility ([74886b7](https://github.com/trixdb/trix-sdk-typescript/commit/74886b71d22d70e1793f9e182e66127344ac4ff8))
* **build:** Build the testing subpath bundle so the export resolves ([#19](https://github.com/trixdb/trix-sdk-typescript/issues/19)) ([a458395](https://github.com/trixdb/trix-sdk-typescript/commit/a45839589913f5c34a3d9eb09b075b489d73f4d4)), closes [#7](https://github.com/trixdb/trix-sdk-typescript/issues/7)
* **build:** Declare the MIT license to match the LICENSE file ([#30](https://github.com/trixdb/trix-sdk-typescript/issues/30)) ([3ea1821](https://github.com/trixdb/trix-sdk-typescript/commit/3ea1821bfe9ae7e20bd3de9f224a5829e838546d))
* **build:** Require Node.js 20+ to match the Web Crypto runtime need ([#24](https://github.com/trixdb/trix-sdk-typescript/issues/24)) ([e30481f](https://github.com/trixdb/trix-sdk-typescript/commit/e30481f2a2d5f8dc0791cb84a12f246f7490c761))
* **client:** Derive version from package.json to stop drift ([#18](https://github.com/trixdb/trix-sdk-typescript/issues/18)) ([5fb68fc](https://github.com/trixdb/trix-sdk-typescript/commit/5fb68fc30dd2a0ada4deb10a7e7e361374c4c177)), closes [#8](https://github.com/trixdb/trix-sdk-typescript/issues/8)
* **client:** Enforce the response cap while reading and time out stalled streams ([#21](https://github.com/trixdb/trix-sdk-typescript/issues/21)) ([6d297af](https://github.com/trixdb/trix-sdk-typescript/commit/6d297af855f4096ad768557902bec491a3ea94ca)), closes [#10](https://github.com/trixdb/trix-sdk-typescript/issues/10)
* **client:** send stable Idempotency-Key on auto-retried writes ([#3](https://github.com/trixdb/trix-sdk-typescript/issues/3)) ([#15](https://github.com/trixdb/trix-sdk-typescript/issues/15)) ([2115edb](https://github.com/trixdb/trix-sdk-typescript/commit/2115edb44fdf4aa56e53928a10e8af206b9e789f))
* Correct hardcoded /v1 paths, drop dead clusterScale, harden paginator ([#23](https://github.com/trixdb/trix-sdk-typescript/issues/23)) ([bef0b1e](https://github.com/trixdb/trix-sdk-typescript/commit/bef0b1eae11e5f5ad817f996d8f16053f9e4880f))
* correct search.similar() and search.query() HTTP methods and paths ([80b31c3](https://github.com/trixdb/trix-sdk-typescript/commit/80b31c318d17b854c42d93355f4f87077c0716f5))
* **pagination:** read snake_case has_more so auto-pagination spans all pages ([#5](https://github.com/trixdb/trix-sdk-typescript/issues/5)) ([#16](https://github.com/trixdb/trix-sdk-typescript/issues/16)) ([da0e524](https://github.com/trixdb/trix-sdk-typescript/commit/da0e524ffe95eb7394d1ae724ed03c061c496a63))
* **relationships:** Address mutations by the (source, target, type) key ([#28](https://github.com/trixdb/trix-sdk-typescript/issues/28)) ([6b4aae2](https://github.com/trixdb/trix-sdk-typescript/commit/6b4aae269427abf15bfb1057adbdfa25b9b36d05))
* Repair the two broken test suites and drop loose any in transcript types ([#25](https://github.com/trixdb/trix-sdk-typescript/issues/25)) ([bf855d9](https://github.com/trixdb/trix-sdk-typescript/commit/bf855d974d9ca854326647253de7acec69b6632f))
* replace Array.from inefficiency in isSensitiveKey ([e0341d0](https://github.com/trixdb/trix-sdk-typescript/commit/e0341d00941ff84852daec3a036d48cbbf953523))
* replace console.warn with thrown errors in pagination ([33055bb](https://github.com/trixdb/trix-sdk-typescript/commit/33055bb7a45516f1ad3f3b58dd43265402c01c0c))
* replace triple assertion with runtime type guard in bots.ts ([2e19a1a](https://github.com/trixdb/trix-sdk-typescript/commit/2e19a1a13d9fa3f76d83769f6af48b415a69bc9b))
* resolve eslint errors from typescript-eslint v8 upgrade ([0ebf322](https://github.com/trixdb/trix-sdk-typescript/commit/0ebf32210fb3715ad6271472482abe37908bd1fa))
* resolve npm audit vulnerabilities ([6d93cfb](https://github.com/trixdb/trix-sdk-typescript/commit/6d93cfb9b299f51232748f2fbdbccd77fef2f5b0))
* **sdk-typescript:** export missing Phase 2-3 types from index.ts ([3e514ac](https://github.com/trixdb/trix-sdk-typescript/commit/3e514ac572ef255adee271cc4359daaf1421025c))
* **sdk:** prepend /v1 in transport + correct bots/personas/facts/entities namespaces (404/410 on most calls) ([#2](https://github.com/trixdb/trix-sdk-typescript/issues/2)) ([654c668](https://github.com/trixdb/trix-sdk-typescript/commit/654c668f0398c70ebffdcc5602e6dd7abf3de449))
* **search:** read `results` from unified search; POST /v1/search in buildContext ([#6](https://github.com/trixdb/trix-sdk-typescript/issues/6)) ([#14](https://github.com/trixdb/trix-sdk-typescript/issues/14)) ([c71267b](https://github.com/trixdb/trix-sdk-typescript/commit/c71267bec8f3801d4a36e6e45fd0381bcb746c86))
* **types:** Convert response types to camelCase with one inbound converter ([#4](https://github.com/trixdb/trix-sdk-typescript/issues/4)) ([#22](https://github.com/trixdb/trix-sdk-typescript/issues/22)) ([414215d](https://github.com/trixdb/trix-sdk-typescript/commit/414215dd41e7439e654ef57bdea73eddfcf842bf))
* **typescript-sdk:** resolve ExpandParams type collision ([beafd2f](https://github.com/trixdb/trix-sdk-typescript/commit/beafd2f9caea888aec3f2a43e86f76912a1d1eac))
* Update test expectations to match SDK implementation paths ([f019dee](https://github.com/trixdb/trix-sdk-typescript/commit/f019dee4221950a86d524668557e12f9d9cf993f))
* use SDK error types and validate runId in bots resource ([a4d8bbb](https://github.com/trixdb/trix-sdk-typescript/commit/a4d8bbb15333550b41095bfec5eb9ad98e80bae4))
* use ValidationError for enrichment type validation ([578bc9c](https://github.com/trixdb/trix-sdk-typescript/commit/578bc9c006cff07ad1f7465b976e6769516274df))
* **utils:** Block private and metadata hosts in base URL validation ([#20](https://github.com/trixdb/trix-sdk-typescript/issues/20)) ([e254cb3](https://github.com/trixdb/trix-sdk-typescript/commit/e254cb3bbe1537fa21379fb57544ac5038d0d5a6)), closes [#12](https://github.com/trixdb/trix-sdk-typescript/issues/12)


### Code Refactoring

* **sdk:** remove admin-only resources and fix bugs ([588d334](https://github.com/trixdb/trix-sdk-typescript/commit/588d334bd27e3ab98e05db1a44c1e1e66a9b844b))
* **utils:** Remove the unwired metrics/telemetry/logging surface ([#27](https://github.com/trixdb/trix-sdk-typescript/issues/27)) ([70c6081](https://github.com/trixdb/trix-sdk-typescript/commit/70c6081d0a9c8f06fff0dc6203e8aafa7bc2cd56))

## [Unreleased]

### Fixed
- **Search contract breaks (#6):** `client.search.query()` now reads `results`
  from the unified-search response (`GET /v1/search` returns `{ results, facets }`,
  never a `data` wrapper) and returns `UnifiedSearchResult[]` instead of `Memory[]`.
  `client.bots.buildContext()` now calls `POST /v1/search` (the removed
  `POST /search/query` route 404'd) and maps each result's `score` to `similarity`.

### Added
- `UnifiedSearchResult` and `UnifiedSearchResponse` types describing the
  `GET`/`POST /v1/search` response shape.
- **Duplicate writes on retry (#3):** mutating requests (POST/PUT/PATCH/DELETE)
  now carry a stable `Idempotency-Key` (UUID v4) that is generated once per
  logical request and reused across every automatic retry. Previously a
  transient 5xx / network / timeout during a write could be re-sent with no
  idempotency guard, causing duplicate writes; trix-api now replays the first
  response instead. GET requests are unaffected, and a caller-supplied
  `Idempotency-Key` (any casing) is preserved.
- **Auto-pagination truncated after page 1 (#5):** `paginateIterator` /
  `paginateAll` read `response.pagination.hasMore`, but the API sends
  `has_more` (snake_case), so `hasMore` was always `undefined` and iteration
  stopped after the first page. Now reads `has_more ?? hasMore`, tolerating
  either shape.

## [0.1.1] - 2025-12-30

### Changed
- Updated package name from @trix/client to @trixdb/client to match npm organization
- Updated homepage to https://trixdb.com
- Updated support URLs to trixdb.com resources
- Removed GitHub repository links (private repository)
- Changed license to proprietary (UNLICENSED)
- Updated README with correct package references and support links
- Removed npm provenance flag for private repository compatibility

## [0.1.0] - 2025-12-30

### Fixed
- Fixed invites test suite that was incorrectly importing from vitest instead of Jest
- Fixed test assertion in invites.test.ts to use `query` instead of `params`

### Changed
- Migrated from Husky to Lefthook for git hooks
- Added comprehensive pre-commit hooks: lint, typecheck, and tests
- Added pre-push hooks: tests with coverage and build verification
- Ensures tests run before commits to catch issues locally before CI

## [1.0.0] - 2025-12-25

### Added

#### Core Features
- Initial release of Trix TypeScript SDK
- Full support for Trix API v1
- Type-safe client with full TypeScript support
- Promise-based async/await API
- Comprehensive type definitions for all API endpoints

#### Resources
- **Memories**: Full CRUD operations, bulk operations, audio transcription
- **Relationships**: Create, update, delete, and reinforce relationships
- **Clusters**: Manage clusters, add/remove memories, cluster expansion
- **Spaces**: Workspace organization and management
- **Graph**: Graph traversal, context retrieval, shortest path finding
- **Search**: Semantic and keyword search, embedding generation
- **Webhooks**: Event notifications and webhook management
- **Agent**: Session management and memory consolidation
- **Feedback**: Search result feedback and relationship creation
- **Highlights**: Text highlighting and auto-extraction
- **Jobs**: Background job monitoring and management

#### Developer Experience
- Automatic retry with exponential backoff for rate limits
- Comprehensive error handling with custom exception types
- Pagination helpers with automatic iteration
- Full IDE autocomplete and IntelliSense support
- Detailed JSDoc documentation
- CommonJS and ESM module support
- Tree-shakeable exports

#### Documentation
- Comprehensive README with examples
- API documentation via JSDoc
- Example scripts for common use cases
- Contributing guidelines

#### Testing
- Unit tests for core functionality
- Integration test structure
- GitHub Actions CI/CD pipeline
- Code coverage reporting

### Technical Details
- Minimum Node.js version: 18.0.0
- Built with TypeScript 5.x
- Dual package (CommonJS + ESM)
- Bundled with tsup for optimal package size
- Support for both API key and JWT authentication
- Optional OpenTelemetry integration

[Unreleased]: https://github.com/trix/trix-typescript-sdk/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/trix/trix-typescript-sdk/releases/tag/v0.1.1
[0.1.0]: https://github.com/trix/trix-typescript-sdk/releases/tag/v0.1.0
[1.0.0]: https://github.com/trix/trix-typescript-sdk/releases/tag/v1.0.0

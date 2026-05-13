(ns portfolio.pro.m365
  "M365 Administration — Entra, Intune, JML workflows, Copilot agents."
  (:require [portfolio.core :as core]
            [portfolio.components :as ui]
            [clojure.string :as str]))

;; ---------------------------------------------------------------------------
;; Mock data — inspired by real M365/Entra patterns
;; ---------------------------------------------------------------------------

(def ^:private jml-workflows
  [{:id :onboard  :label "Onboard"  :icon "🟢" :color "#00a86b"
    :steps ["HR submits new hire in HRIS" "Lifecycle Workflow triggers (Entra ID Governance)"
            "Classify NEW_HIRE → Service Bus topic" "Entra Provisioning → SCIM/Guest/Cloud"
            "AD sync (~40 min) → Entra ID sync" "Assign security groups · M365 license"
            "Intune enrolls device · Conditional Access applies"]}
   {:id :transfer :label "Transfer" :icon "🔄" :color "#0078d4"
    :steps ["HRIS fires CHANGE event" "Lifecycle Workflow classifies change type"
            "Service Bus → provisioning function" "Review current access (access reviews)"
            "Revoke old groups · assign new groups" "Update access packages · reassign Intune policy"]}
   {:id :offboard :label "Offboard" :icon "🔴" :color "#ff0040"
    :steps ["HRIS fires TERMINATION event" "Lifecycle Workflow triggers offboarding"
            "Disable Entra ID sign-in · revoke sessions" "Remove group memberships"
            "Reclaim licenses ($30/user/mo Copilot)" "Convert mailbox · archive OneDrive · wipe device"]}])

(def ^:private entra-groups
  [{:name "SG-Eng-Azure-Contributor" :members 42 :type "Security"     :roles ["Azure VM Admin" "Fabric Reader" "Key Vault Secrets User"]}
   {:name "SG-HR-M365-Users"        :members 18 :type "Security"     :roles ["M365 HR Portal" "Copilot User"]}
   {:name "SG-Infra-PIM-Eligible"   :members 8  :type "PIM-Eligible" :roles ["Global Reader" "Security Admin" "Intune Admin"]}
   {:name "SG-Finance-Reports"      :members 15 :type "Security"     :roles ["Power BI Pro" "Fabric Viewer" "Cost Management Reader"]}
   {:name "SG-All-Employees"        :members 260 :type "Dynamic"     :roles ["M365 User" "Copilot Chat" "Teams Standard"]}])

(def ^:private access-packages
  [{:title "Engineer"       :icon "⚙" :packages ["dev-basic" "storage-reader" "fabric-contributor" "github-member"]}
   {:title "Manager"        :icon "📊" :packages ["management-reports" "cost-reader" "power-bi-pro" "planner-admin"]}
   {:title "HR"             :icon "👥" :packages ["hr-onboard" "hr-reports" "people-admin" "lifecycle-workflows"]}
   {:title "Security Admin" :icon "🛡" :packages ["sentinel-operator" "defender-admin" "pim-eligible" "conditional-access"]}])

(def ^:private copilot-agents
  [{:name "Confluence Cloud" :desc "Search and summarize Confluence pages from M365 Copilot chat"
    :icon "📚" :url "https://m365.cloud.microsoft/chat/?titleId=P_7c69ad60-9565-29c7-8bd9-d83f454ee238"}
   {:name "Project Planner"  :desc "Interview-driven project scoping — 95% understanding before building"
    :icon "📋" :url "https://m365.cloud.microsoft/chat/?titleId=T_d9cda51e-3f77-e62c-7ee6-ad679bac42ce"}
   {:name "Teams Meetings"   :desc "Recap transcripts, extract action items, search past meetings"
    :icon "🎤" :url "https://m365.cloud.microsoft/chat/?titleId=T_807e00ed-cace-ba5f-04e1-12afb68fba24"}])

(def ^:private intune-policies
  [{:name "Windows Compliance"     :platform "Windows" :status "Compliant" :devices 182 :pct 96}
   {:name "macOS Encryption"       :platform "macOS"   :status "Compliant" :devices 34  :pct 100}
   {:name "iOS MDM Profile"        :platform "iOS"     :status "Warning"   :devices 78  :pct 89}
   {:name "Conditional Access MFA" :platform "All"     :status "Compliant" :devices 294 :pct 98}])

;; ---------------------------------------------------------------------------
;; State
;; ---------------------------------------------------------------------------

(def ^:private state (atom {:active-workflow 0 :active-step 0}))

;; ---------------------------------------------------------------------------
;; Components
;; ---------------------------------------------------------------------------

(defn- metrics-panel []
  (let [panel (core/create-el "div" {:class "metrics-row"})]
    (doseq [[label value color] [["Entra Groups"     (str (count entra-groups))    "#0078d4"]
                                  ["Access Packages"  (str (reduce + (map #(count (:packages %)) access-packages))) "#00a86b"]
                                  ["Copilot Agents"   (str (count copilot-agents))  "#8b008b"]
                                  ["Intune Policies"  (str (count intune-policies)) "#b8860b"]]]
      (.appendChild panel
        (core/create-el "div" {:class "metric-card"}
          (core/create-el "div" {:class "metric-value" :style (str "color:" color)} value)
          (core/create-el "div" {:class "metric-label"} label))))
    panel))

(defn- workflow-steps [wf]
  (let [flow (core/create-el "div" {:class "pipeline-flow" :style "flex-wrap:wrap;justify-content:flex-start"})]
    (doseq [[i step] (map-indexed vector (:steps wf))]
      (when (pos? i)
        (.appendChild flow (core/create-el "div" {:class "flow-arrow"} "→")))
      (let [card (core/create-el "div" {:class "stage-card"
                                         :style (str "border-left:4px solid " (:color wf))}
                   (core/create-el "div" {:class "stage-header"}
                     (core/create-el "span" {:class "stage-icon"} (str (inc i)))
                     (core/create-el "span" {:class "stage-label"} step)))]
        (.addEventListener card "click"
          (fn [_] (core/toast! (str (:icon wf) " " (:label wf) " step " (inc i) ": " step))))
        (.appendChild flow card)))
    flow))

(defn- workflow-section []
  (let [section (core/create-el "div" {})
        step-container (core/create-el "div" {:class "event-log"})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "👤 JML Lifecycle Workflows"))
    ;; workflow selector buttons
    (let [bar (core/create-el "div" {:class "filter-bar"})]
      (doseq [[i wf] (map-indexed vector jml-workflows)]
        (let [btn (core/create-el "button"
                    {:class (str "filter-btn" (when (= i (:active-workflow @state)) " active"))}
                    (str (:icon wf) " " (:label wf)))]
          (.addEventListener btn "click"
            (fn [_]
              (swap! state assoc :active-workflow i :active-step 0)
              ;; re-render steps
              (set! (.-innerHTML step-container) "")
              (.appendChild step-container (workflow-steps (nth jml-workflows i)))
              ;; update active btn
              (doseq [b (array-seq (.querySelectorAll bar ".filter-btn"))]
                (.remove (.-classList b) "active"))
              (.add (.-classList btn) "active")))
          (.appendChild bar btn)))
      (.appendChild section bar))
    (.appendChild step-container (workflow-steps (first jml-workflows)))
    (.appendChild section step-container)
    section))

(defn- groups-section []
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "🔐 Entra ID Security Groups"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Group" "Type" "Members" "Roles"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [g entra-groups]
          (let [row (core/create-el "tr" {})]
            (.appendChild row (core/create-el "td" {:style "font-family:monospace;font-weight:600"} (:name g)))
            (.appendChild row (core/create-el "td" {}
              (let [badge (core/create-el "span" {:class "effect-badge"
                                                   :style (str "background:" (case (:type g) "PIM-Eligible" "#ff0040" "Dynamic" "#ffaa00" "#0078d4"))}
                            (:type g))]
                badge)))
            (.appendChild row (core/create-el "td" {} (str (:members g))))
            (.appendChild row (core/create-el "td" {:style "color:var(--clr-text-muted);font-size:0.85em"} (str/join ", " (:roles g))))
            (.addEventListener row "click"
              (fn [_] (core/toast! (str "🔐 " (:name g) " — " (:members g) " members"))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild section table))
    section))

(defn- access-section []
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "📦 Access Packages by Role"))
    (let [grid (core/create-el "div" {:class "pipeline-flow" :style "flex-direction:column;align-items:stretch"})]
      (doseq [ap access-packages]
        (let [card (core/create-el "div" {:class "stage-card"}
                     (core/create-el "div" {:class "stage-header"}
                       (core/create-el "span" {:class "stage-icon"} (:icon ap))
                       (core/create-el "span" {:class "stage-label"} (:title ap)))
                     (core/create-el "p" {:class "stage-desc"}
                       (str/join " · " (:packages ap))))]
          (.addEventListener card "click"
            (fn [_] (core/toast! (str (:icon ap) " " (:title ap) ": " (count (:packages ap)) " packages"))))
          (.appendChild grid card)))
      (.appendChild section grid))
    section))

(defn- agents-section []
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "🤖 M365 Copilot Agents"))
    (let [grid (core/create-el "div" {:class "pipeline-flow" :style "flex-direction:column;align-items:stretch"})]
      (doseq [agent copilot-agents]
        (let [card (core/create-el "a" {:class "stage-card" :href (:url agent) :target "_blank" :rel "noopener noreferrer"
                                         :style "text-decoration:none;color:inherit;cursor:pointer"}
                     (core/create-el "div" {:class "stage-header"}
                       (core/create-el "span" {:class "stage-icon"} (:icon agent))
                       (core/create-el "span" {:class "stage-label"} (:name agent)))
                     (core/create-el "p" {:class "stage-desc"} (:desc agent)))]
          (.appendChild grid card)))
      (.appendChild section grid))
    section))

(defn- intune-section []
  (let [section (core/create-el "div" {})]
    (.appendChild section (core/create-el "h3" {:class "log-title"} "📱 Intune Device Compliance"))
    (let [table (core/create-el "table" {:class "log-table"})
          thead (core/create-el "thead" {})
          hrow  (core/create-el "tr" {})]
      (doseq [h ["Policy" "Platform" "Devices" "Compliance"]]
        (.appendChild hrow (core/create-el "th" {} h)))
      (.appendChild thead hrow)
      (.appendChild table thead)
      (let [tbody (core/create-el "tbody" {})]
        (doseq [p intune-policies]
          (let [row (core/create-el "tr" {})
                bar-container (core/create-el "div" {:class "compliance-bar"})
                bar-fill (core/create-el "div" {:class "compliance-fill"
                                                 :style (str "width:" (:pct p) "%;background:"
                                                             (cond (>= (:pct p) 95) "#00a86b"
                                                                   (>= (:pct p) 85) "#ffaa00"
                                                                   :else "#ff0040"))})]
            (.appendChild bar-container bar-fill)
            (.appendChild row (core/create-el "td" {:style "font-weight:600"} (:name p)))
            (.appendChild row (core/create-el "td" {} (:platform p)))
            (.appendChild row (core/create-el "td" {} (str (:devices p))))
            (let [td (core/create-el "td" {})]
              (.appendChild td bar-container)
              (.appendChild td (core/create-el "span" {:style "margin-left:0.5em;font-size:0.85em"} (str (:pct p) "%")))
              (.appendChild row td))
            (.addEventListener row "click"
              (fn [_] (core/toast! (str "📱 " (:name p) " — " (:pct p) "% across " (:devices p) " devices"))))
            (.appendChild tbody row)))
        (.appendChild table tbody))
      (.appendChild section table))
    section))

;; ---------------------------------------------------------------------------
;; Main
;; ---------------------------------------------------------------------------

(defn- m365-content []
  (let [container (core/create-el "div" {:class "dashboard-container"})]
    (.appendChild container (core/create-el "h1" {:class "dashboard-title"} "M365 Administration"))
    (.appendChild container (core/create-el "p" {:class "dashboard-subtitle"}
      "Entra ID governance, Intune compliance, JML lifecycle workflows, and Copilot agents"))
    (.appendChild container (metrics-panel))
    (.appendChild container (workflow-section))
    (.appendChild container (groups-section))
    (.appendChild container (access-section))
    (.appendChild container (intune-section))
    (.appendChild container (agents-section))
    container))

(defn init []
  (core/mount!
    (ui/page-shell :m365 "/articles/m365-admin.html" "src/portfolio/pro/m365.cljs"
                   (m365-content))))

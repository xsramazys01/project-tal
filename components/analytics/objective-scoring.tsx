"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, Target, TrendingUp, Award } from "lucide-react"

interface ObjectiveScoringProps {
  formulas: {
    weekly: string
    monthly: string
    structural: string
  }
}

export function ObjectiveScoring({ formulas }: ObjectiveScoringProps) {
  const scoringCriteria = [
    {
      range: "95-100%",
      grade: "A+",
      color: "bg-green-100 text-green-800 border-green-200",
      description: "Excellent Performance",
      icon: Award,
    },
    {
      range: "90-94%",
      grade: "A",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Very Good Performance",
      icon: TrendingUp,
    },
    {
      range: "85-89%",
      grade: "B+",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      description: "Good Performance",
      icon: Target,
    },
    {
      range: "80-84%",
      grade: "B",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      description: "Satisfactory Performance",
      icon: Calculator,
    },
    {
      range: "<80%",
      grade: "C",
      color: "bg-red-100 text-red-800 border-red-200",
      description: "Needs Improvement",
      icon: Calculator,
    },
  ]

  const componentWeights = [
    { component: "Daily Planning (DP)", weight: 40, description: "Daily task planning and organization" },
    { component: "Report Harian (RH)", weight: 20, description: "Daily progress reporting" },
    { component: "Weekly Objective (WO)", weight: 40, description: "Weekly goal achievement" },
  ]

  return (
    <div className="space-y-6">
      {/* Scoring Formulas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-blue-600" />
            Scoring Formulas & Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Weekly Score</h3>
              <div className="text-sm text-blue-600 font-mono bg-white p-2 rounded">{formulas.weekly}</div>
              <p className="text-xs text-blue-700 mt-2">Calculated weekly based on three main components</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3 className="font-semibold text-emerald-800 mb-2">Monthly Staff Score</h3>
              <div className="text-sm text-emerald-600 font-mono bg-white p-2 rounded">{formulas.monthly}</div>
              <p className="text-xs text-emerald-700 mt-2">Average of all weekly scores in the month</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Structural Score</h3>
              <div className="text-sm text-purple-600 font-mono bg-white p-2 rounded">{formulas.structural}</div>
              <p className="text-xs text-purple-700 mt-2">Weighted combination of TAL and MO scores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5 text-emerald-600" />
            Score Components & Weights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {componentWeights.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{component.component}</h3>
                  <p className="text-sm text-gray-600">{component.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Progress value={component.weight} className="w-24" />
                  <Badge variant="outline" className="font-mono">
                    {component.weight}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grading Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-yellow-600" />
            Performance Grading Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoringCriteria.map((criteria, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border-2 border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${criteria.color} font-bold text-lg px-3 py-1`}>{criteria.grade}</Badge>
                  <criteria.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-gray-900">{criteria.range}</div>
                  <div className="text-sm text-gray-600">{criteria.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Calculation Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Week 1 January Calculation:</h3>
            <div className="space-y-2 text-sm font-mono">
              <div>Daily Planning (DP): 40.00 points</div>
              <div>Report Harian (RH): 15.00 points</div>
              <div>Weekly Objective (WO): 40.00 points</div>
              <div className="border-t pt-2 mt-2">
                <strong>Total Score = (40.00 × 40%) + (15.00 × 20%) + (40.00 × 40%)</strong>
              </div>
              <div>
                <strong>Total Score = 16.00 + 3.00 + 16.00 = 35.00 points</strong>
              </div>
              <div className="text-emerald-600">
                <strong>Percentage = 95.00%</strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

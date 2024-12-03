// Previous imports remain the same...

export function AssessmentDisplay({ assessment, user }: AssessmentDisplayProps) {
  // Previous state and handlers remain the same...

  if (!assessment) return null;

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Learning Unit Summary */}
      <div className="p-6 bg-blue-900/30 border border-blue-800 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold text-blue-300">Learning Unit Summary</h2>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-blue-200">{assessment.learningUnit.title}</h3>
          <p className="text-blue-100">{assessment.learningUnit.summary}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-blue-300">Academic Level</p>
              <p className="text-blue-100">{assessment.learningUnit.level}</p>
            </div>
            <div>
              <p className="text-sm text-blue-300">Reading Time</p>
              <p className="text-blue-100">{assessment.learningUnit.readingTime} minutes</p>
            </div>
            <div>
              <p className="text-sm text-blue-300">Knowledge Impact Units (KIU)</p>
              <p className="text-blue-100">{assessment.learningUnit.kiu} KIU</p>
            </div>
            <div>
              <p className="text-sm text-blue-300">CPD/CME Points</p>
              <p className="text-blue-100">{assessment.learningUnit.cpdPoints} points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
    </div>
  );
}
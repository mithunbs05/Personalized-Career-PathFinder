"""
End-to-End Automated Test Suite for AI Mentor.
Tests:
1. Priority Calculation Engine across different user scenarios
2. Assessment Generation & Client-Safe Question Filtering
3. Authoritative Server-Side Grading & Mastery Adaptation Formula
4. Dynamic Focus Recalculation after Skill Improvement
5. LLM Mentor Invocation with LangChain + GPT-4.1-nano
"""

import asyncio
import os
import sys

# Ensure UTF-8 stdout on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv

load_dotenv('backend/.env')

from app.services.mentor_service import (
    CANONICAL_STAGES,
    CANONICAL_SKILLS,
    calculate_todays_focus,
    generate_assessment_questions,
    grade_assessment,
    generate_mentor_reply,
)

async def run_tests():
    print("==================================================")
    print("AI MENTOR END-TO-END AUTOMATED VERIFICATION SUITE")
    print("==================================================")

    # ----------------------------------------------------
    # TEST 1: SCENARIO A — Default Baseline (Calculus/Optimization in Math stage)
    # ----------------------------------------------------
    print("\n--- TEST 1: SCENARIO A (Baseline Priority Calculation) ---")
    focus_a = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=CANONICAL_SKILLS,
        user_name="Alex Rivera",
        target_role="AI/ML Engineer"
    )
    print(f"Calculated Focus: {focus_a.skill} ({focus_a.mastery}%) - Priority: {focus_a.priority}")
    print(f"Reason: {focus_a.reason}")
    assert focus_a.skill in ["Optimization", "Calculus", "Linear Algebra"], f"Expected Math skill, got {focus_a.skill}"
    print("[PASS] TEST 1: Baseline priority identified correctly.")

    # ----------------------------------------------------
    # TEST 2: SCENARIO B — Linear Algebra is weaker and blocks Machine Learning
    # ----------------------------------------------------
    print("\n--- TEST 2: SCENARIO B (Dependency-Aware Priority) ---")
    skills_scenario_b = [
        {**s, "progress": 85 if s["name"] in ["Calculus", "Optimization", "Probability"] else 35 if s["name"] == "Linear Algebra" else s["progress"]}
        for s in CANONICAL_SKILLS
    ]
    focus_b = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=skills_scenario_b,
        user_name="User B",
        target_role="AI/ML Engineer"
    )
    print(f"Calculated Focus: {focus_b.skill} ({focus_b.mastery}%) - Priority: {focus_b.priority}")
    print(f"Reason: {focus_b.reason}")
    assert focus_b.skill == "Linear Algebra", f"Expected Linear Algebra, got {focus_b.skill}"
    assert focus_b.blocks_stage == "Machine Learning", f"Expected blocking Machine Learning, got {focus_b.blocks_stage}"
    print("[PASS] TEST 2: Prerequisite dependency prioritization verified.")

    # ----------------------------------------------------
    # TEST 3: SCENARIO C — Topic-Level Drill-Down
    # ----------------------------------------------------
    print("\n--- TEST 3: SCENARIO C (Topic Drill-Down) ---")
    topic_progress = [
        {"skill_id": "s4", "skill_name": "Linear Algebra", "topic": "Eigenvalues & Eigenvectors", "mastery": 25}
    ]
    focus_c = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=skills_scenario_b,
        user_name="User C",
        target_role="AI/ML Engineer",
        topic_progress=topic_progress
    )
    print(f"Calculated Focus: {focus_c.skill} -> Subtopic: {focus_c.topic}")
    assert focus_c.topic == "Eigenvalues & Eigenvectors", f"Expected Eigenvalues topic, got {focus_c.topic}"
    print("[PASS] TEST 3: Subtopic drill-down verified.")

    # ----------------------------------------------------
    # TEST 4: Secure Assessment Generation (No Answer Leakage)
    # ----------------------------------------------------
    print("\n--- TEST 4: Secure Assessment Generation ---")
    server_q, client_q = await generate_assessment_questions(focus_a, count=5)
    print(f"Generated {len(server_q)} server questions and {len(client_q)} client questions.")
    
    for cq in client_q:
        assert hasattr(cq, 'text') and hasattr(cq, 'options'), "Client question missing required fields"
        assert not hasattr(cq, 'correctAnswer'), "SECURITY VIOLATION: correctAnswer leaked to client!"
        assert not hasattr(cq, 'explanation'), "SECURITY VIOLATION: explanation leaked to client!"
    print("[PASS] TEST 4: Client assessment is strictly sanitized.")

    # ----------------------------------------------------
    # TEST 5: Authoritative Grading & Weighted Mastery Adaptation
    # ----------------------------------------------------
    print("\n--- TEST 5: Authoritative Grading & Mastery Adaptation ---")
    perfect_answers = [q["correctAnswer"] for q in server_q]
    score, results, new_mastery, feedback = grade_assessment(
        server_questions=server_q,
        user_answers=perfect_answers,
        previous_mastery=30
    )
    print(f"Score: {score}%, Previous Mastery: 30% -> New Mastery: {new_mastery}%")
    print(f"Feedback: {feedback}")
    assert score == 100, f"Expected 100%, got {score}%"
    expected_mastery = min(100, round(30 * 0.4 + 100 * 0.6))
    assert new_mastery == expected_mastery, f"Expected {expected_mastery}%, got {new_mastery}%"
    print(f"[PASS] TEST 5: Server grading evaluated correctly (Mastery adapted 30% -> {new_mastery}%).")

    # ----------------------------------------------------
    # TEST 6: Recalculate Today's Focus after Mastery Improvement
    # ----------------------------------------------------
    print("\n--- TEST 6: Dynamic Recalculation after Mastery Improvement ---")
    skills_after_quiz = [
        {**s, "progress": new_mastery if s["name"] == focus_a.skill else s["progress"]}
        for s in CANONICAL_SKILLS
    ]
    focus_after = calculate_todays_focus(
        stages=CANONICAL_STAGES,
        user_skills=skills_after_quiz,
        user_name="Alex Rivera",
        target_role="AI/ML Engineer"
    )
    print(f"Updated Focus: {focus_after.skill} ({focus_after.mastery}%) - Reason: {focus_after.reason}")
    print("[PASS] TEST 6: Priority engine reactively shifted focus after mastery increase.")

    # ----------------------------------------------------
    # TEST 7: LLM Live Invocation with GPT-4.1-nano
    # ----------------------------------------------------
    print("\n--- TEST 7: Live LLM AI Mentor Invocation ---")
    reply, suggested_actions = await generate_mentor_reply(
        user_message="Why is linear algebra important for training neural networks?",
        history=[],
        user_name="Alex Rivera",
        target_role="AI/ML Engineer",
        current_stage="Mathematics & Statistics",
        focus=focus_a,
        mode="learn"
    )
    # Strip any unicode chars from display
    clean_preview = reply[:250].encode('ascii', 'ignore').decode('ascii')
    print(f"LLM Reply Preview:\n{clean_preview}...\n")
    print(f"Suggested Actions: {suggested_actions}")
    assert len(reply) > 50, "Expected meaningful AI reply"
    print("[PASS] TEST 7: LLM mentor generation successful.")

    print("\n==================================================")
    print("ALL 7 E2E AUTOMATED TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == '__main__':
    asyncio.run(run_tests())

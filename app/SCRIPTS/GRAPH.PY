import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# Data extracted from the User Simulation (Danny Persona)
# Simulation A (Standard) is inferred based on the "Novice ADHD" persona struggling with blocks of text.
# Simulation B (SuChef) uses the exact scores provided in your prompt.

data = {
    "Step": list(range(1, 15)),
    "Standard Recipe (Text Block)": [3, 5, 6, 4, 5, 6, 7, 6, 7, 10, 9, 9, 6, 3], # Inferred High Friction
    "SuChef (Hybrid System)":       [2, 3, 5, 2, 3, 3, 4, 4, 4, 8,  6, 7, 4, 2]  # Actual Data from your Prompt
}

df = pd.DataFrame(data)

# Set up the visual style
plt.figure(figsize=(12, 6))
sns.set_style("whitegrid")
plt.rcParams['font.family'] = 'sans-serif'

# Plotting the lines
plt.plot(df["Step"], df["Standard Recipe (Text Block)"], 
         marker='o', linestyle='--', color='#e74c3c', linewidth=2, label="Simulation A: Standard Recipe")

plt.plot(df["Step"], df["SuChef (Hybrid System)"], 
         marker='o', linestyle='-', color='#2ecc71', linewidth=3, label="Simulation B: SuChef System")

# Adding the "Panic Threshold" zone
plt.axhline(y=8, color='gray', linestyle=':', alpha=0.5)
plt.text(0.5, 8.2, 'Cognitive Overload / Panic Threshold', color='gray', fontsize=9)

# Annotation for key moments described in the simulation
# Step 10: The Risotto Loop (High Memory Demand)
plt.annotate('Step 10: Complex Loop\n(Standard: Panic / SuChef: Managed Stress)', 
             xy=(10, 10), xytext=(6, 9.5),
             arrowprops=dict(facecolor='black', shrink=0.05, alpha=0.3),
             fontsize=9, backgroundcolor='white')

# Step 3: Ambiguity
plt.annotate('Step 3: "Stir Occasionally"\n(Ambiguity)', 
             xy=(3, 5), xytext=(3, 6.5),
             arrowprops=dict(facecolor='black', shrink=0.05, alpha=0.3),
             fontsize=8)

# Titles and Labels
plt.title('Cognitive Friction Comparison: Mushroom Risotto Task', fontsize=16, fontweight='bold', pad=20)
plt.xlabel('Cooking Steps', fontsize=12)
plt.ylabel('Mental Friction Score (1-10)', fontsize=12)
plt.xticks(range(1, 15))
plt.yticks(range(1, 11))
plt.legend(loc='upper left', frameon=True, framealpha=0.9, shadow=True)

# Fill area to show the "Value Gap"
plt.fill_between(df["Step"], df["Standard Recipe (Text Block)"], df["SuChef (Hybrid System)"], 
                 color='gray', alpha=0.1, label='Cognitive Load Reduction')

plt.tight_layout()

# Save the plot
plt.savefig('cognitive_load_comparison.png', dpi=300)
print("Graph generated successfully as 'cognitive_load_comparison.png'")
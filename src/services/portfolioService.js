import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const portfolioService = {
  async addPosition(positionData) {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const positionsRef = collection(db, 'positions');
      await addDoc(positionsRef, {
        ...positionData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding position:', error);
      throw new Error(error.message || 'Failed to add position');
    }
  },

  async updatePosition(positionId, positionData) {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const positionRef = doc(db, 'positions', positionId);
      await updateDoc(positionRef, {
        ...positionData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating position:', error);
      throw new Error(error.message || 'Failed to update position');
    }
  },

  async deletePosition(positionId) {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const positionRef = doc(db, 'positions', positionId);
      await deleteDoc(positionRef);
    } catch (error) {
      console.error('Error deleting position:', error);
      throw new Error(error.message || 'Failed to delete position');
    }
  },

  async getUserPositions() {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const positionsRef = collection(db, 'positions');
      const q = query(positionsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null
      }));
    } catch (error) {
      console.error('Error getting user positions:', error);
      throw new Error(error.message || 'Failed to get positions');
    }
  },

  calculateMetrics(positions, currentPrices) {
    try {
      if (!positions.length) {
        return {
          totalValue: 0,
          totalCost: 0,
          totalGain: 0,
          totalGainPercent: 0,
          diversity: {}
        };
      }

      const metrics = {
        totalValue: 0,
        totalCost: 0,
        totalGain: 0,
        totalGainPercent: 0,
        diversity: {}
      };

      // Calculate position values and sector diversity
      positions.forEach(position => {
        const currentPrice = currentPrices[position.symbol]?.c || position.purchasePrice;
        const positionValue = currentPrice * position.quantity;
        const positionCost = position.purchasePrice * position.quantity;

        metrics.totalValue += positionValue;
        metrics.totalCost += positionCost;

        // Update sector diversity
        metrics.diversity[position.sector] = (metrics.diversity[position.sector] || 0) + positionValue;
      });

      // Calculate total gain/loss
      metrics.totalGain = metrics.totalValue - metrics.totalCost;
      metrics.totalGainPercent = metrics.totalCost > 0 
        ? (metrics.totalGain / metrics.totalCost) * 100 
        : 0;

      // Convert sector values to percentages
      if (metrics.totalValue > 0) {
        Object.keys(metrics.diversity).forEach(sector => {
          metrics.diversity[sector] = (metrics.diversity[sector] / metrics.totalValue) * 100;
        });
      }

      return metrics;
    } catch (error) {
      console.error('Error calculating metrics:', error);
      throw new Error(error.message || 'Failed to calculate metrics');
    }
  },

  getPositionSizeRecommendations(portfolioValue, riskLevel = 'moderate') {
    const riskLevels = {
      conservative: {
        maxPositionSize: 0.05,
        maxSectorExposure: 0.20
      },
      moderate: {
        maxPositionSize: 0.10,
        maxSectorExposure: 0.30
      },
      aggressive: {
        maxPositionSize: 0.15,
        maxSectorExposure: 0.40
      }
    };

    const risk = riskLevels[riskLevel] || riskLevels.moderate;
    
    return {
      maxPositionValue: portfolioValue * risk.maxPositionSize,
      maxSectorValue: portfolioValue * risk.maxSectorExposure,
      riskLevel,
      recommendations: [
        `Maximum position size: ${(risk.maxPositionSize * 100).toFixed(1)}% ($${(portfolioValue * risk.maxPositionSize).toFixed(2)})`,
        `Maximum sector exposure: ${(risk.maxSectorExposure * 100).toFixed(1)}% ($${(portfolioValue * risk.maxSectorExposure).toFixed(2)})`,
        'Consider rebalancing positions that exceed these limits',
        'Maintain diversification across sectors',
        'Review and rebalance portfolio regularly'
      ]
    };
  }
};

export default portfolioService; 